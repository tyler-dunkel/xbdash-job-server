var randomstring = require("randomstring");
var xboxApiObject = require('./xbox-api.js');
var async = require('async');
var createAndBuild = require('./leaderboards-api/create-and-build.js');
var contestFunctions = require('./contests-api/contestFunctions.js');
var updateBadges = require('./badge-api/badges.js');
var welcomeEmailSend = require('./mailer-welcome.js');
var moment = require('moment');
var db = require('./db.js');

var profileBuilder = function (job, callback) {
	if (job) {
		var userId = job.data.userId;
		var users = db.collection('users');
		
		console.log('starting build user profile job for: ' + userId + ' at: ' + moment().format());
		users.findOne({
			_id: userId
		}, function (err, user) {
			if (!user || !user.xuid) {
				console.log('there is no xuid');
				job.done();
				callback();
				return;
			}
			async.series([
				function (cb) {
					xboxApiObject.updateGamercard(userId, function (err, res) {
						if (err) {
							console.log('error with update gamercard');
							console.log(err);
						}
						cb();
					});
				},
				function (cb) {
					xboxApiObject.updateXboxProfile(userId, function (err, res) {
						if (err) {
							console.log('error with update xbox profile');
							console.log(err);
						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateXboxPresence(userId, function (err, res) {
						if (err) {
							console.log('error with update xbox presence');
							console.log(err);

						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateRecentActivity(userId, function (err, res) {
						if (err) {
							console.log('error with update recent activity');
							console.log(err);

						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateVideoClips(userId, function (err, res) {
						if (err) {
							console.log('error with update video clips');
							console.log(err);

						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateScreenShots(userId, function (err, res) {
						if (err) {
							console.log('error with update screen shots');
							console.log(err);
						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateXboxOneData(userId, function (err, res) {
						if (err) {
							console.log('error with update x1 games');
							console.log(err);
						}
						cb();
					});
				},
				function (cb) {
					xboxApiObject.updateXbox360Data(userId, function (err, res) {
						if (err) {
							console.log('error with update 360 games');
							console.log(err);
						}
						cb();
					});
				},
				function (cb) {
					users.update({
						_id: userId
					}, {
						$set: {
							'gamertagScanned.status': "true",
							'gamertagScanned.lastUpdate': new Date()
						}
					}, function (err, res) {
						if (err) {
							console.log('error in db update');
						}
						cb();
					});
				},
				function (cb) {
					createAndBuild(userId, function (err, res) {
						if (err) {
							console.log(err);
						}
						cb();
					});
				},
				function (cb) {
					updateBadges(userId, function(err, res) {
						if (err) {
							console.log('err updating badges');
							console.log(err);
						}
						cb();
					});
				},
				function (cb) {
					welcomeEmailSend(userId, function (err, res) {
						if (err) {
							console.log('error sending welcome email');
							console.log(err);
						}
						cb();
					});
				}
			], function(err) {
				job.done && job.done({}, {}, function (err, res) {
					if (err) {
						console.log('error in ending job');
					}
					console.log('ending build user profile job for: ' + userId + ' at: ' + moment().format());
					callback();
				});
			});
		});
	}
}

var dirtyUpdateUserStats = function (job, callback) {
	if (job) {
		var users = db.collection('users');
		console.log('starting dirty stat job at: ' + moment().format());

		var processUser = function (user, asyncCb) {
			xboxApiObject.dirtyUpdateUserStats(user._id, function (err, res) {
				if (err) {
					console.log('error on xbox api dirty user update');
					console.log(err);
				}
				createAndBuild(user._id, function (err, res) {
					if (err) {
						console.log(err);
					}
					updateBadges(user._id, function (err, res) {
						if (err) {
							console.log(err);
						}
						contestFunctions.updateUserEntries(user._id, function(err) {
							asyncCb && asyncCb();
						});
					});
				});
			});
		}

		var q = async.queue(processUser, 1);

		users.find({
			'gamertagScanned.status': 'true',
			'gamercard.gamerscore': {
				$gt: 0
			}
		}).sort({
			'gamertagScanned.lastUpdate': 1
		}).limit(10).toArray(function (err, userDocs) {
			userDocs.forEach(function (user) {
				if (!user || !user.gamercard) {
					return;
				}
				users.update({
					_id: user._id
				}, {
					$set: {
						'gamertagScanned.status': 'updating'
					}
				}, function () {
					q.push(user, function (err) {});
				});
			});
		});
		q.drain = function (err) {
			console.log('ending dirty stat job at: ' + moment().format());
			job.done && job.done({}, {}, function (err, res) {
				callback && callback();
			});
		}
	}
}

var chooseContestWinner = function(job, callback) {
	if (job) {
		var xbdContests = db.collection('xbdcontests'),
			userContestEntries = db.collection('usercontestentries'),
			contestId = job.data.contestId;

		xbdContests.findOne({_id: contestId}, function(err, contest) {
			
			var processEntry = function(entry, asyncCb) {
				if (entry) {
					if (entry.contestType === 'referral') {
						asyncCb && asyncCb();
						return;
					}
					if (entry.contestType === 'timeAttack') {
						contestFunctions.scanTimeAttack(entry, contest, function(err) {
							if (err) {
								console.log('there was an error scanning this daily contest entry');
								console.log(err);
							}
							asyncCb && asyncCb();
						});
					}
					if (entry.contestType === 'completeGame' || entry.contestType === 'completeAchievements') {
						contestFunctions.scanCompleteObjective(entry, contest, function(err) {
							if (err) {
								console.log('there was an error scanning this daily contest entry');
								console.log(err);
							}
							asyncCb && asyncCb();
						});
					} 
				} else {
					asyncCb();
				}
			}

			var q = async.queue(processEntry, 1);

			userContestEntries.find({contestToken: contest.contestToken}, function(err, entries) {
				entries.forEach(function(entry) {
					q.push(entry, function(err) {
						if (err) {
							console.log(err);
						}
					});
				});
			});

			q.drain = function(err) {
				contestFunctions.chooseWinner(contest, function(err) {
					job.done && job.done({}, {}, function (err, res) {
						callback && callback();
					});
				});
			}
		});
	}
}

var clearDailyRanks = function (job, callback) {
	if (job) {
		var userLeaderboards = db.collection('userleaderboards');
		console.log('starting clear daily rank job at: ' + moment.utc().format());
		userLeaderboards.update({}, {
				$set: {
					'dailyRank.value': 0,
					'dailyRank.rank': 0
				}
			}, {
				multi: true
			},
			function (err) {
				if (err) {
					console.log(err);
				}
				console.log('ending clear daily rank job at: ' + moment.utc().format());
				job.done && job.done({}, {}, function (err, res) {
					callback && callback();
				});
			});
	}
}

var updateGameClips = function(job, callback) {
	if (job) {
		console.log('starting update game clips function at: ' + moment().format());
		var users = db.collection('users');

		var _updateClipFunc = function(user, cb) {
			var users = db.collection('users');
			console.log('starting update clip function for: ' + user._id + ' at: ' + moment().format());
			async.series([
				function(callback) {
					xboxApiObject.updateVideoClips(user._id, function(err) {
						callback();
					});
				},
				function(callback) {
					xboxApiObject.updateRecentActivity(user._id, function(err) {
						callback();
					});
				},
				function(callback) {
					xboxApiObject.updateXboxPresence(user._id, function(err) {
						callback();
					});
				},
				function(callback) {
					users.update({_id: user._id}, {$set: {'gamertagScanned.status': 'true', lastClipUpdate: new Date()}}, function(err) {
						if (err) {
							console.log(err);
						}
						callback();
					});
				}
			], function(err) {
				console.log('ending update clip function for: ' + user._id + ' at: ' + moment().format());
				cb();
			});
		}
		users.find({
			'gamertagScanned.status': 'true',
			'gamercard.gamerscore': {
				$gt: 0
			}
		}).sort({
			'lastClipUpdate': 1
		}).limit(20).toArray(function(err, userDocs) {
			userDocs.forEach(function(userDoc) {
				users.update({_id: userDoc._id}, {$set: {'gamertagScanned.status': 'updating'}}, function(err) {
					if (err) {
						console.log(err);
					}
				});
			});
			async.eachLimit(userDocs, 1, _updateClipFunc, function(err) {
				job.done && job.done({}, {}, function (err, res) {
					callback && callback();
				});
			});
		});
	}
}

var removeCompleteJobsWorker = function(job, callback) {
	console.log('started remove complete jobs worker function at: ' + moment().format());
	db.collection('xbdjobscollection.jobs').remove({}, function(err) {
		job.done && job.done({}, {}, function (err, res) {
			callback && callback();
			console.log('ended remove complete jobs worker function at: ' + moment().format());
		});
	});
}

module.exports = {
	profileBuilder: profileBuilder,
	dirtyUpdateUserStats: dirtyUpdateUserStats,
	clearDailyRanks: clearDailyRanks,
	updateGameClips: updateGameClips,
	removeCompleteJobsWorker: removeCompleteJobsWorker
}