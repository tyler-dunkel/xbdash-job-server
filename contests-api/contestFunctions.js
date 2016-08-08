var moment = require('moment');
var db = require('../db.js');
var xboxApiObject = require('../xbox-api.js');
var async = require('async');
var timeFrameCounts = require('../leaderboards-api/timeframe-counts.js');
var userAchievements = db.collection('userachievements');
var xbdAchievements = db.collection('xbdachievements');
var userContestEntries = db.collection('usercontestentries');
var userLeaderboards = db.collection('userleaderboards');
var xbdContests = db.collection('xbdcontests');
var users = db.collection('users');

var updateUserEntries = function(userId, cb) {
	console.log('started updating user entries for: ' + userId + ' at: ' + moment().format());
	userContestEntries.find({status: 'active'}).toArray(function(err, entries) {
		if (entries.length < 1) {
			cb();
			return;
		}

		var updateEntry = function(entry, callback) {
			if (!entry || !entry.contestType) {
				callback();
				return;
			}
			if (entry.contestType === 'referral') {
				callback();
			}
			else if (entry.contestType === 'timeAttack') {
				xbdContests.findOne({contestToken: entry.contestToken}, function(err, contest) {
					_updateTimeAttackEntry(entry, contest, function(err) {
						callback();
					});
				});
			} 
			else if (entry.contestType === 'completeGame') {
				xbdContests.findOne({contestToken: entry.contestToken}, function(err, contest) {
					_updateCompleteGameEntry(entry, contest, function(err) {
						callback();
					});
				});
			} 
			else if (entry.contestType === 'completeAchievements') {
				xbdContests.findOne({contestToken: entry.contestToken}, function(err, contest) {
					_updateCompleteAchievementsEntry(entry, contest, function(err) {
						callback();
					});
				});
			} else {
				callback();
			}
		}

		async.each(entries, updateEntry, function(err) {
			cb();
		});
	});
}


var chooseWinner = function(contest, cb) {
	var rank = 0,
		sortSel = {'data.value': -1};
	if (conest.type === 'completeGame' || contest.type === 'completeAchievements') {
		sortSel = {'data.completeTime': 1};
	}
	userContestEntries.find({contestToken: contest.contestToken}).sort(sortSel).forEach(function(err, entry) {
		if (err) {
			console.log('there was an error finding the contest entries');
			console.log(err);
			cb && cb();
			return;
		}
		if (!entry) {
			xbdContests.update({_id: contest._id}, {$set: {'status': 'complete'}}, function(err) {
				cb && cb();
				return;
			});
		}

		rank++;
		if (rank === 1) {
			userContestEntries.update({_id: entry._id}, {$set: {'data.rank': rank, status: 'winner'}}, function(err) {
				xbdContests.update({_id: contest._id}, {$set: {winnerId: entry.userId}}, function(err) {

				});
			});
		} else {
			userContestEntries.update({_id: entry._id}, {$set: {'data.rank': rank, status: 'complete'}}, function(err) {

			});
		}
	});
}
var scanTimeAttackEntry = function(entry, contest, cb) {
	users.findOne({_id: entry.userId}, function(err, user) {
		if (user) {
			async.series([
				function(callback) {
					xboxApiObject.dirtyUpdateUserStats(user._id, function(err) {
						if (err) {
							console.log('scanTimeAttackEntry. error scanning entries achievements: ' + user._id + ' at: ' + moment().format());
							callback(err, null);
						}
						callback();
					});
				},
				function(callback) {
					_updateTimeAttackEntry(entry, contest, function(err) {
						callback();
					});
				}
			], function(err) {
				if (err) {
					console.log('there was an error processing the entry');
				}
				cb();
			});
		} else {
			cb();
		}
	});
}

var scanCompleteObjective = function(entry, contest, cb) {
	users.findOne({_id: entry.userId}, function(err, user) {
		if (user) {
			async.series([
				function(callback) {
					xboxApiObject.dirtyUpdateUserStats(user._id, function(err) {
						if (err) {
							console.log('scanTimeAttackEntry. error scanning entries for: ' + user._id + ' at: ' + moment().format());
							callback(err, null);
						}
						callback();
					});
				},
				function(callback) {
					if (entry.contestType === 'completeGame') {
						_updateCompleteGameEntry(entry, contest, function(err) {
							if (err) {
							console.log('scanCompleteObjective. error scanning entries for: ' + user._id + ' at: ' + moment().format());
							callback(err, null);
							}
							callback();
						});
					} else if (entry.contestType === 'completeAchievements') {
						_updateCompleteAchievementsEntry(entry, contest, function(err) {
							if (err) {
							console.log('scanCompleteObjective. error scanning entries for: ' + user._id + ' at: ' + moment().format());
							callback(err, null);
							}
							callback();
						});
					} else {
						console.log('scanCompleteObjective. error! this contest entry has a type I dont recognize');
						console.log(entry);
						callback();
					}
				}
			], function(err) {
				if (err) {
					console.log('there was an error processing the entry for: ' + user._id);
				}
				cb();
			});
		} else {
			cb();
		}
	});
}

var _rankTimeAttackEntries = function(contest, cb) {
	var rank = 0;

	userContestEntries.find({status: 'active', contestToken: contest.contestToken}).sort({'data.completeTime': -1}).forEach(function(err, contestEntry) {
		if (err) {
			console.log(err);
			callback && callback();
			return;
		}
		if (!contestEntry) {
			callback && callback();
			return;
		}
		rank++;
		userContestEntries.update({_id: contestEntry._id}, {$set: {rank: rank}}, function() {

		});
	});
}

var _updateCompleteGameEntry = function(entry, contest, cb) {
	var gameId = contest.data.gameId;
	userGames.find({userId: entry.userId, gameId: gameId}, function(err, game) {
		if (game.completed) {
			userContestEntries.update({_id: entry._id}, {$set: {'data.completeTime': game.lastUnlock}}, function(err) {
				cb();
			});
		} else {
			cb();
		}
	});
}

var _updateCompleteAchievementsEntry = function(entry, contest, cb) {
	var achievementIdArray = contest.data.achievementIdArray,
		areAchievementsComplete = [],
		lastUnlockTime,
		isAchievementCompleteFunc;

	isAchievementCompleteFunc = function(achievementId, callback) {
		userAchievements.findOne({userId: entry.userId, achievementId: achievementId}, function(err, achievement) {
			if (achievement.progressionState) {
				areAchievementsComplete.push('true');
				
				if (lastUnlockTime instanceof Date) {
					if (lastUnlockTime < achievement.progression) {
						lastUnlockTime = achievement.progression;
					}
				} else {
					lastUnlockTime = achievement.progression;
				}
				callback();
			} else {
				areAchievementsComplete.push('false');
			}
		});
	}

	async.each(achievementIdArray, isAchievementCompleteFunc, function(err) {
		if (areAchievementsComplete.indexOf('false') === -1) {
			userContestEntries.update({_id: entry._id}, {$set: {'data.completeTime': lastUnlockTime}}, function(err) {
				cb();
			});
		}
	});
}


var _updateTimeAttackEntry = function(entry, contest, cb) {
	users.findOne({_id: entry.userId}, function(err, user) {
		var gamerscoreCount = 0;

		var getGamerscoreValue = function(userAchi, callback) {
			xbdAchievements.findOne({_id: userAchi.achievementId}, function(err, achi) {
				if (!achi) {
					console.log('error. not xbdAchievement for this userAchievement: ' + userAchi.achievementId);
					callback();
					return;
				}
				gamerscoreCount += achi.value;
			});
		}

		if (!user || !user.gamercard) {
			cb('error no user', null);
			return;
		}
		userAchievements.find({userId: user._id, progressState: true, progression: {
			$gte: contest.startDate,
			$lte: contest.endDate
		}}).toArray(function(err, achievementArray) {
			if (achievementArray.length < 1) {
				userContestEntries.update({_id: entry._id}, {$set: {'data.value': gamerscoreCount, 'data.rank': 0}}, function(err) {
					cb();
				});
			} else {
				async.each(achievementArray, getGamerscoreValue, function(err) {
					userContestEntries.update({_id: entry._id}, {$set: {'data.value': gamerscoreCount}}, function(err){
						_rankTimeAttackEntries(contest, function(err) {
							callback();
						});
					});
				});
			}
		});
	});
}
// var scanWeeklyEntry = function(entry, cb) {
// 	users.findOne({_id: entry.userId}, function(err, user) {
// 		if (user) {
// 			async.series([
// 				function(callback) {
// 					xboxApiObject.dirtyUpdateUserStats(user._id, function(err) {
// 						if (err) {
// 							console.log('there was an error counting the users achievements ');
// 						}
// 						callback();
// 					});
// 				},
// 				function(callback) {
// 					timeFrameCounts.weeklyCount(user, function(err) {
// 						if (err) {
// 							console.log('there was an error counting the users achievements ');
// 						}
// 						callback();
// 					});
// 				}
// 			], function(err) {
// 				if (err) {
// 					console.log('there was an error processing the entry');
// 				}
// 				cb();
// 			});
// 		}
// 	});
// }

// var scanMonthlyEntry = function(entry, cb) {
// 	users.findOne({_id: entry.userId}, function(err, user) {
// 		if (user) {
// 			async.series([
// 				function(callback) {
// 					xboxApiObject.dirtyUpdateUserStats(user._id, function(err) {
// 						if (err) {
// 							console.log('there was an error counting the users achievements ');
// 						}
// 						callback();
// 					});
// 				},
// 				function(callback) {
// 					timeFrameCounts.monthlyCount(user, function(err) {
// 						if (err) {
// 							console.log('there was an error counting the users achievements ');
// 						}
// 						callback();
// 					});
// 				}
// 			], function(err) {
// 				if (err) {
// 					console.log('there was an error processing the entry');
// 				}
// 				cb();
// 			});
// 		}
// 	});
// }

module.exports= {
	scanTimeAttackEntry: scanTimeAttackEntry,
	chooseWinner: chooseWinner,
	updateUserEntries: updateUserEntries,
	scanCompleteObjective: scanCompleteObjective
}
