var randomstring = require("randomstring");
var xboxApiObject = require('./xbox-api.js');
var async = require('async');
var createAndBuild = require('./leaderboards-api/create-and-build.js');
var updateBadges = require('./badge-api/badges.js');
var welcomeEmailSend = require('./mailer-welcome.js');
var moment = require('moment');
var db = require('./db.js');

var profileBuilder = function (job, callback) {
	if (job) {
		var userId = job.data.userId;
		var users = db.collection('users');
		console.log(userId);
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
						}
						console.log('update gamercard done, moving to x1');
						cb();
					});
				},
				function (cb) {
					xboxApiObject.updateXboxProfile(userId, function (err, res) {
						if (err) {
							console.log('error with update gamercard');
						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateXboxPresence(userId, function (err, res) {
						if (err) {
							console.log('error with update gamercard');
							cb();
							return;
						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateRecentActivity(userId, function (err, res) {
						if (err) {
							console.log('error with update gamercard');
							cb();
							return;
						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateVideoClips(userId, function (err, res) {
						if (err) {
							console.log('error with update gamercard');
							cb();
							return;
						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateScreenShots(userId, function (err, res) {
						if (err) {
							console.log('error with update gamercard');
							cb();
							return;
						}
						cb && cb();
					});
				},
				function (cb) {
					xboxApiObject.updateXboxOneData(userId, function (err, res) {
						if (err) {
							console.log('error with update x1 games');
						}
						console.log('update xbox 1 done, moving to x360');
						cb();
					});
				},
				function (cb) {
					xboxApiObject.updateXbox360Data(userId, function (err, res) {
						if (err) {
							console.log('error with update 360 games');
						}
						console.log('done with xbox360 games');
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
						console.log('done with build leaderboard');
						cb();
					});
				},
				function (cb) {
					updateBadges(userId, function(err, res) {
						if (err) {
							console.log('err updating badges');
						}
						cb();
					});
				},
				function (cb) {
					welcomeEmailSend(userId, function (err, res) {
						if (err) {
							console.log('error sending welcome email');
						}
						cb();
					});
				}
			], function(err) {
				job.done && job.done({}, {}, function (err, res) {
					if (err) {
						console.log('error in ending job');
					}
					console.log('user: ' + userId + 'finished building at: ' + moment.format('dddd, MMMM Do YYYY, h:mm:ss a'));
					callback();
				});
			});
		});
	}
}

var dirtyUpdateUserStats = function (job, callback) {
	if (job) {
		var users = db.collection('users');
		var processUser = function (user, asyncCb) {
			xboxApiObject.dirtyUpdateUserStats(user._id, function (err, res) {
				if (err) {
					console.log('error on xbox api dirty user update');
					asyncCb && asyncCb();
					return;
				}
				createAndBuild(user._id, function (err, res) {
					if (err) {
						console.log(err);
						asyncCb && asyncCb();
						return;
					}
					updateBadges(user._id, function (err, res) {
						if (err) {
							console.log(err);
							asyncCb && asyncCb();
							return;
						}
						console.log('calling async cb');
						asyncCb && asyncCb();
					});
				});
			});
		}
		var q = async.queue(processUser, 1);
		// change back later***
		users.find({
			'gamertagScanned.status': 'true',
			'gamercard.gamerscore': {
				$gt: 0
			}
		}).sort({
			'gamertagScanned.lastUpdate': 1
		}).limit(5).toArray(function (err, userDocs) {
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
			console.log('queue drained');
			job.done("dirty user job is done");
			callback && callback();
		}
	}
}

var clearDailyRanks = function (job, callback) {
	if (job) {
		var userLeaderboards = db.collection('userleaderboards');
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
				console.log('daily ranks cleared');
				job.done && job.done({}, {}, function (err, res) {
					callback && callback();
				});
			});
	}
}

module.exports = {
	profileBuilder: profileBuilder,
	dirtyUpdateUserStats: dirtyUpdateUserStats,
	clearDailyRanks: clearDailyRanks
}