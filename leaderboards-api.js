var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiCaller = require('./xbox-api-caller.js');
var async = require('async');
var moment = require('moment');

var db = mongoJS(meteorUrl);

var leaderboardsApi = leaderboardsApi || {};

leaderboardsApi.buildUserRanks = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var users = db.collection('users');
	var userLeaderboards = db.collection('userleaderboards');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'error retrieving user', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			callback({ reason: 'the users gamertag isnt scanned' }, null);
			return;
		}
		if (user.gamertagScanned.status === 'false' || user.gamertagScanned.status === 'building') {
			return;
		}
		userLeaderboards.find({ userId: userId }, function(err, userStat) {
			if (err) {
				callback({ reason: 'error retrieving user', data: err }, null);
				return;
			}
			userStat.count(function(err, userCount) {
				if (err) {
					callback && callback(err, null);
					return;
				}
				if (userCount > 0) return;

				var userStats = {
					userId: userId,
					overallRank: 0,
					dailyRank: { value: 0, rank: 0 },
					completedGames: { count: 0, rank: 0 },
					completedAchievements: { count: 0, rank: 0 },
					totalAchievements: { count: 0, rank: 0 },
					commonAchievements: { count: 0, rank: 0 },
					rareAchievements: { count: 0, rank: 0 },
					epicAchievements: { count: 0, rank: 0 },
					legendaryAchievements: { count: 0, rank: 0 }
				};

				userLeaderboards.insert(userStats);
				callback && callback();
			});
		});
	});
}

leaderboardsApi.updateUserCounts = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var users = db.collection('users');
	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ userId: userId }, function(err, userStat) {
		if (err) {
			callback({ reason: 'error retrieving user stats', data: err }, null);
			return;
		}
		if (!userStat) return;

		userStat.count(function(err, userCount) {
			if (err) {
				callback && callback(err, null);
				return;
			}
			if (userCount === 0) return;

			async.parallel([
				function(callback) {
					console.log('calling user daily gamerscore count');
					leaderboardsApi.countUserDailyGamerscore(userId, function(err, result) {
						if (err) {
							callback(err, null);
							console.log('error in counting user daily gamerscores');
							return;
						}
						callback();
					});
				},
				function(callback) {
					console.log('calling user completeed games count');
					leaderboardsApi.countUserCompletedGames(userId, function(err, result) {
						if (err) {
							callback(err, null);
							console.log('error in counting user completed games');
							return;
						}
						callback();
					});
				},
				function(callback) {
					console.log('calling completed achievements count');
					leaderboardsApi.countCompletedAchievements(userId, function(err, result) {
						if (err) {
							callback(err, null);
							console.log('error in counting completed achievements');
							return;
						}
						callback();
					});
				},
				function(callback) {
					console.log('calling total achievements count');
					leaderboardsApi.countTotalAchievements(userId, function(err, result) {
						if (err) {
							callback(err, null);
							console.log('error in counting total achievements');
							return;
						}
						callback();
					});
				},
				function(callback) {
					console.log('calling common achievements count');
					leaderboardsApi.countCommonAchievements(userId, function(err, result) {
						if (err) {
							callback(err, null);
							console.log('error in counting common achievements');
							return;
						}
						callback();
					});
				},
				function(callback) {
					console.log('calling rare achievements count');
					leaderboardsApi.countRareAchievements(userId, function(err, result) {
						if (err) {
							callback(err, null);
							console.log('error in counting rare achievements');
							return;
						}
						callback();
					});
				},
				function(callback) {
					console.log('calling epic achievements count');
					leaderboardsApi.countEpicAchievements(userId, function(err, result) {
						if (err) {
							callback(err, null);
							console.log('error in counting epic achievements');
							return;
						}
						callback();
					});
				},
				function(callback) {
					console.log('calling legendary achievements count');
					leaderboardsApi.countLegendaryAchievements(userId, function(err, result) {
						if (err) {
							callback(err, null);
							console.log('error in counting legendary achievements');
							return;
						}
						callback();
					});
				}
			], function(err, result) {
				if (err) {
					callback(err, null);
					console.log('error in finishing counting functions');
					return;
				}
				console.log('all counting functions done');
				var date = moment().format();
				userLeaderboards.update({ userId: userId }, { $set: { updated: date } });
				callback && callback();
			});
		});
	});
}

leaderboardsApi.updateUserRanks = function(callback) {
	leaderboardsApi.updateOverallRank(function(err, result) {
		callback && callback();
	});
	leaderboardsApi.dailyRank(function(err, result) {
		callback && callback();
	});
	leaderboardsApi.updateUserCompletedGamesRank(function(err, result) {
		callback && callback();
	});
	leaderboardsApi.updateCompletedAchievementsRank(function(err, result) {
		callback && callback();
	});
	leaderboardsApi.updateTotalAchievementsRank(function(err, result) {
		callback && callback();
	});q
	leaderboardsApi.updateCommonAchievementsRank(function(err, result) {
		callback && callback();
	});
	leaderboardsApi.updateRareAchievementsRank(function(err, result) {
		callback && callback();
	});
	leaderboardsApi.updateEpicAchievementsRank(function(err, result) {
		callback && callback();
	});
	leaderboardsApi.updateLegendaryAchievementsRank(function(err, result) {
		callback && callback();
	});
}

leaderboardsApi.updateOverallRank = function(callback) {
	var userOverallRank = 1;
	var users = db.collection('users');
	var userLeaderboards = db.collection('userleaderboards');
	users.find({ "gamercard.gamerscore": { $gt: 1 } }).sort({ "gamercard.gamerscore": -1 }, function(err, user) {
		if (err) return;
		if (!user) return;
		user.forEach(function(err, user) {
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user._id },
				update: { $set: { 'overallRank': userOverallRank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				userOverallRank++;
				callback && callback();
			});
		});
	});
};

leaderboardsApi.countUserDailyGamerscore = function(userId, callback) {

	// need to review
	
	var userDailyGamerscore = 0;
	var users = db.collection('users');
	var userLeaderboards = db.collection('userleaderboards');
	var oneDay = moment().startOf('day').toDate();
	var userAchievements = db.collection('userachievements');
	var xbdAchievements = db.collection('xbdachievements');

	userLeaderboards.find({ userId: userId }, function(err, userStat) {
		if (err) return;
		if (!userStat) return;
		userStat.count(function(err, userCount) {
			if (err) {
				callback && callback(err, null);
				return;
			}
			if (!userCount > 0) return;
		});
	});

	userAchievements.find({ userId: userId, progressState: true, progression: { $gte: oneDay } }, function(err, userAchi) {
		if (err) return;
		if (!userAchi) return;
		userAchi.count(function(err, achiCount) {
			if (err) {
				callback && callback(err, null);
				return;
			}
			if (!achiCount > 0) {
				userLeaderboards.findAndModify({
					query: { userId: userId },
					update: { $set: { 'dailyRank.value': userDailyGamerscore } },
					new: true
				}, function (err, doc, lastErrorObject) {
					callback && callback();
				});
			} else {
				userAchi.forEach(function(err, achiCount) {
					if (!user) return;
					xbdAchievements.findOne({
						_id: userAchi.achievementId
					}, function(err, doc) {
						var singleAchievementValue = doc.value;
						userDailyGamerscore += singleAchievementValue;
					});
				});
				userLeaderboards.findAndModify({
					query: { userId: userId },
					update: { $set: { 'dailyRank.value': userDailyGamerscore } },
					new: true
				}, function (err, doc, lastErrorObject) {
					userOverallRank++;
					callback && callback();
				});
			}
		});
	});
	// var userDailyGamerscore = 0;
	// var userStat = userLeaderboards.find({ userId: userId });
	// var oneDay = moment().startOf('day').toDate();
	// if (!userStat || !userStat.count() || !userStat.count() > 0) return;

	// var userDailyAchievements = userAchievements.find({ userId: userId, progressState: true, progression: { $gte: oneDay } });
	// //find each users gamerscore for the past 24 hours and put it into a field called userDailyGamerscore
	// if (!userDailyAchievements || !userDailyAchievements.count() || !userDailyAchievements.count() > 0) {
	// 	userLeaderboards.update({ userId: userId }, { $set: { 'dailyRank.value': userDailyGamerscore } });
	// 	return;
	// }

	// userDailyAchievements.forEach(function(achievement) {
	// 	var singleAchievementValue = xbdAchievements.findOne({ _id: achievement.achievementId }).value;
	// 	userDailyGamerscore += singleAchievementValue;
	// });
	// userLeaderboards.update({ userId: userId }, { $set: { 'dailyRank.value': userDailyGamerscore } });
}

leaderboardsApi.dailyRank = function(callback) {
	//find each user and assign them a daily rank based upon the above computed userDailyGamerscore
	var userDailyRank = 1;
	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ 'dailyRank.value': { $gt: 1 } }).sort({ 'dailyRank.value': -1 }, function(err, user) {
		if (err) return;
		if (!user) return;
		user.forEach(function(err, user) {
			if (err) return;
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user.userId },
				update: { $set: { 'dailyRank.rank': userDailyRank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				userDailyRank++;
				callback && callback();
			});
		});
	});
	// var userDailyRank = 1;
	// var userStats = userLeaderboards.find({ 'dailyRank.value': { $gt: 1 } }, { $sort: { 'dailyRank.value': -1 } });
	
	// userStats.forEach(function(userStat){
	// 	userLeaderboards.update({ userId: userStat.userId }, { $set: { 'dailyRank.rank': userDailyRank } });
	// 	userDailyRank++;
	// });
}

leaderboardsApi.countUserCompletedGames = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var userGames = db.collection('usergames');
	var userLeaderboards = db.collection('userleaderboards');

	userGames.find({ userId: userId }, function(err, userGame) {
		userGame.count(function(err, gameCount) {
			if (err) {
				callback && callback(err, null);
				return;
			}
			userLeaderboards.findAndModify({
				query: { userId: userId },
				update: { $set: { 'completedGames.count': gameCount } },
				new: true
			}, function (err, doc, lastErrorObject) {
				callback && callback();
			});
		});
	});
	// check(userId, String);
	// var completedGames = userGames.find({ userId: userId, completed: true });
	// var count = completedGames ? completedGames.count() : 0;
	// userLeaderboards.update({ userId: userId }, { $set: { 'completedGames.count': count } });
}

leaderboardsApi.updateUserCompletedGamesRank = function(callback) {
	var rank = 1;
	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ 'completedGames.count': { $gt: 0 } }).sort({ 'completedGames.count': -1 }, function(err, userStat) {
		userStat.forEach(function(err, user) {
			if (err) return;
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user.userId },
				update: { $set: { 'completedGames.rank': rank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				rank++;
				callback && callback();
			});
		});
	});
	// var rank = 1;
	// var userStats = userLeaderboards.find({'completedGames.count': { $gte: 1 } }, { sort: { 'completedGames.count': -1 } });
	// if (!userStats || !userStats.count() || !userStats.count() > 0) return;
	// userStats.forEach(function(userStat) {
	// 	userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedGames.rank': rank } });
	// 	rank++;
	// });
}

leaderboardsApi.countCompletedAchievements = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.find({ userId: userId }, function(err, userAchi) {
		userAchi.count(function(err, achiCount) {
			if (err) {
				callback && callback(err, null);
				return;
			}
			userLeaderboards.findAndModify({
				query: { userId: userId },
				update: { $set: { 'completedAchievements.count': achiCount } },
				new: true
			}, function (err, doc, lastErrorObject) {
				callback && callback();
			});
		});
	});
	// check(userId, String);
	// var completedAchievements = userAchievements.find({ userId: userId, progressState: true });
	// var count = completedAchievements ? completedAchievements.count() : 0;
	// userLeaderboards.update({ userId: userId }, { $set: { 'completedAchievements.count': count } });
}

leaderboardsApi.updateCompletedAchievementsRank = function(callback) {
	var rank = 1;
	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ 'completedAchievements.count': { $gt: 0 } }).sort({ 'completedAchievements.count': -1 }, function(err, userStat) {
		userStat.forEach(function(err, user) {
			if (err) return;
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user.userId },
				update: { $set: { 'completedAchievements.rank': rank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				rank++;
				callback && callback();
			});
		});
	});
	// var rank = 1;
	// var userStats = userLeaderboards.find({ 'completedAchievements.count': { $gte: 1 } }, { sort: { 'completedAchievements.count': -1 } });
	// if (!userStats || !userStats.count() || !userStats.count() > 0) return;
	// userStats.forEach(function(userStat) {
	// 	userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedAchievements.rank': rank } });
	// 	rank++;
	// });
}

leaderboardsApi.countTotalAchievements = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.find({ userId: userId }, function(err, userAchi) {
		userAchi.count(function(err, achiCount) {
			if (err) {
				callback && callback(err, null);
				return;
			}
			userLeaderboards.findAndModify({
				query: { userId: userId },
				update: { $set: { 'totalAchievements.count': achiCount } },
				new: true
			}, function (err, doc, lastErrorObject) {
				callback && callback();
			});
		});
	});	
	// check(userId, String);
	// var totalAchievements = userAchievements.find({ userId: userId });
	// var count = totalAchievements ? totalAchievements.count() : 0;
	// userLeaderboards.update({ userId: userId }, { $set: { 'totalAchievements.count': count } });
}

leaderboardsApi.updateTotalAchievementsRank = function(callback) {
	var rank = 1;

	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ 'totalAchievements.count': { $gt: 0 } }).sort({ 'totalAchievements.count': -1 }, function(err, userStat) {
		userStat.forEach(function(err, user) {
			if (err) return;
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user.userId },
				update: { $set: { 'totalAchievements.rank': rank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				rank++;
				callback && callback();
			});
		});
	});
	// var rank = 1;
	// var userStats = userLeaderboards.find({ 'totalAchievements.count': { $gte: 1 } }, { sort: { 'totalAchievements.count': -1 } });
	// if (!userStats || !userStats.count() || !userStats.count() > 0) return;
	// userStats.forEach(function(userStat) {
	// 	userLeaderboards.update({ userId: userStat.userId }, { $set: { 'totalAchievements.rank': rank } });
	// 	rank++;
	// });
}

leaderboardsApi.countCommonAchievements = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var commonCount = 0;
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');
	var xbdAchievements = db.collection('xbdachievements');

	userAchievements.find({ userId: userId, progressState: true }, function(err, userAchi) {
		userAchi.forEach(function(err, user) {
			xbdAchievements.findOne({
				_id: user.achievementId
			}, function(err, doc) {
				if (doc.userPercentage && doc.userPercentage >= 61) {
					commonCount++;
				}
			});
		});
		userLeaderboards.findAndModify({
			query: { userId: userId },
			update: { $set: { 'commonAchievements.count': commonCount } },
			new: true
		}, function (err, doc, lastErrorObject) {
			callback && callback();
		});
	});
	// check(userId, String);
	// var commonCount = 0;
	// var userAchievement = userAchievements.find({ userId: userId, progressState: true });
	// if (!userAchievement) return;
	// userAchievement.forEach(function(a) {
	// 	var achievement = xbdAchievements.findOne({ _id: a.achievementId });
	// 	var userPercentage = achievement.userPercentage;
	// 	if (userPercentage && userPercentage >= 61) {
	// 		commonCount++;
	// 	}
	// });
	// userLeaderboards.update({ userId: userId }, { $set: { 'commonAchievements.count': commonCount } });
}

leaderboardsApi.updateCommonAchievementsRank = function() {
	var rank = 1;

	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ 'commonAchievements.count': { $gt: 0 } }).sort({ 'commonAchievements.count': -1 }, function(err, userStat) {
		userStat.forEach(function(err, user) {
			if (err) return;
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user.userId },
				update: { $set: { 'commonAchievements.rank': rank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				rank++;
				callback && callback();
			});
		});
	});
	// var rank = 1;
	// var userStats = userLeaderboards.find({'commonAchievements.count': { $gte: 1 }}, { sort: { 'commonAchievements.count': -1 } });
	// if (!userStats || !userStats.count() || !userStats.count() > 0) return;
	// userStats.forEach(function(userStat) {
	// 	userLeaderboards.update({ userId: userStat.userId }, { $set: { 'commonAchievements.rank': rank } });
	// 	rank++;
	// });
}

leaderboardsApi.countRareAchievements = function(userId) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var rareCount = 0;
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');
	var xbdAchievements = db.collection('xbdachievements');

	userAchievements.find({ userId: userId, progressState: true }, function(err, userAchi) {
		userAchi.forEach(function(err, user) {
			xbdAchievements.findOne({
				_id: user.achievementId
			}, function(err, doc) {
				if (doc.userPercentage && (doc.userPercentage >= 31 && doc.userPercentage <= 60)) {
					rareCount++;
				}
			});
		});
		userLeaderboards.findAndModify({
			query: { userId: userId },
			update: { $set: { 'rareAchievements.count': rareCount } },
			new: true
		}, function (err, doc, lastErrorObject) {
			callback && callback();
		});
	});
	// check(userId, String);
	// var rareCount = 0;
	// var userAchievement = userAchievements.find({ userId: userId, progressState: true });
	// if (!userAchievement) return;
	// userAchievement.forEach(function(a) {
	// 	var achievement = xbdAchievements.findOne({ _id: a.achievementId });
	// 	var userPercentage = achievement.userPercentage;
	// 	if (userPercentage && (userPercentage >= 31 && userPercentage <= 60)) {
	// 		rareCount++;
	// 	}
	// });
	// userLeaderboards.update({ userId: userId }, { $set: { 'rareAchievements.count': rareCount } });
}

leaderboardsApi.updateRareAchievementsRank = function() {
	var rank = 1;

	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ 'rareAchievements.count': { $gt: 0 } }).sort({ 'rareAchievements.count': -1 }, function(err, userStat) {
		userStat.forEach(function(err, user) {
			if (err) return;
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user.userId },
				update: { $set: { 'rareAchievements.rank': rank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				rank++;
				callback && callback();
			});
		});
	});
	// var rank = 1;
	// var userStats = userLeaderboards.find({'rareAchievements.count': { $gte: 1 } }, { sort: { 'rareAchievements.count': -1 } });
	// if (!userStats || !userStats.count() || !userStats.count() > 0) return;
	// userStats.forEach(function(userStat) {
	// 	userLeaderboards.update({ userId: userStat.userId }, { $set: { 'rareAchievements.rank': rank } });
	// 	rank++;
	// });
}

leaderboardsApi.countEpicAchievements = function(userId) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var epicCount = 0;
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');
	var xbdAchievements = db.collection('xbdachievements');

	userAchievements.find({ userId: userId, progressState: true }, function(err, userAchi) {
		userAchi.forEach(function(err, user) {
			xbdAchievements.findOne({
				_id: user.achievementId
			}, function(err, doc) {
				if (doc.userPercentage && (doc.userPercentage >= 11 && doc.userPercentage <= 30)) {
					epicCount++;
				}
			});
		});
		userLeaderboards.findAndModify({
			query: { userId: userId },
			update: { $set: { 'epicAchievements.count': epicCount } },
			new: true
		}, function (err, doc, lastErrorObject) {
			callback && callback();
		});
	});
	// check(userId, String);
	// var epicCount = 0;
	// var userAchievement = userAchievements.find({ userId: userId, progressState: true });
	// if (!userAchievement) return;
	// userAchievement.forEach(function(a) {
	// 	var achievement = xbdAchievements.findOne({ _id: a.achievementId });
	// 	var userPercentage = achievement.userPercentage;
	// 	if (userPercentage && (userPercentage >= 11 && userPercentage <= 30)) {
	// 		epicCount++;
	// 	}
	// });
	// userLeaderboards.update({ userId: userId }, { $set: { 'epicAchievements.count': epicCount } });
}

leaderboardsApi.updateEpicAchievementsRank = function() {
	var rank = 1;

	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ 'epicAchievements.count': { $gt: 0 } }).sort({ 'epicAchievements.count': -1 }, function(err, userStat) {
		userStat.forEach(function(err, user) {
			if (err) return;
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user.userId },
				update: { $set: { 'epicAchievements.rank': rank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				rank++;
				callback && callback();
			});
		});
	});
	// var rank = 1;
	// var userStats = userLeaderboards.find({'epicAchievements.count': { $gte: 1 } }, { sort: { 'epicAchievements.count': -1 } });
	// if (!userStats || !userStats.count() || !userStats.count() > 0) return;
	// userStats.forEach(function(userStat) {
	// 	userLeaderboards.update({ userId: userStat.userId }, { $set: { 'epicAchievements.rank': rank } });
	// 	rank++;
	// });
}

leaderboardsApi.countLegendaryAchievements = function(userId) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var legendaryCount = 0;
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');
	var xbdAchievements = db.collection('xbdachievements');

	userAchievements.find({ userId: userId, progressState: true }, function(err, userAchi) {
		userAchi.forEach(function(err, user) {
			xbdAchievements.findOne({
				_id: user.achievementId
			}, function(err, doc) {
				if (doc.userPercentage && (doc.userPercentage >= 0 && doc.userPercentage <= 10)) {
					legendaryCount++;
				}
			});
		});
		userLeaderboards.findAndModify({
			query: { userId: userId },
			update: { $set: { 'legendaryAchievements.count': legendaryCount } },
			new: true
		}, function (err, doc, lastErrorObject) {
			callback && callback();
		});
	});
	// check(userId, String);
	// var legendaryCount = 0;
	// var userAchievement = userAchievements.find({ userId: userId, progressState: true });
	// if (!userAchievement) return;
	// userAchievement.forEach(function(a) {
	// 	var achievement = xbdAchievements.findOne({ _id: a.achievementId });
	// 	var userPercentage = achievement.userPercentage;
	// 	if (userPercentage && (userPercentage >= 0 && userPercentage <= 10)) {
	// 		legendaryCount++;
	// 	}
	// });
	// userLeaderboards.update({ userId: userId }, { $set: { 'legendaryAchievements.count': legendaryCount } });
}

leaderboardsApi.updateLegendaryAchievementsRank = function() {
	var rank = 1;

	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ 'legendaryAchievements.count': { $gt: 0 } }).sort({ 'legendaryAchievements.count': -1 }, function(err, userStat) {
		userStat.forEach(function(err, user) {
			if (err) return;
			if (!user) return;
			userLeaderboards.findAndModify({
				query: { userId: user.userId },
				update: { $set: { 'legendaryAchievements.rank': rank } },
				new: true
			}, function (err, doc, lastErrorObject) {
				rank++;
				callback && callback();
			});
		});
	});	
	// var rank = 1;
	// var userStats = userLeaderboards.find({'legendaryAchievements.count': { $gte: 1 } }, { sort: { 'legendaryAchievements.count': -1 } });
	// if (!userStats || !userStats.count() || !userStats.count() > 0) return;
	// userStats.forEach(function(userStat) {
	// 	userLeaderboards.update({ userId: userStat.userId }, { $set: { 'legendaryAchievements.rank': rank } });
	// 	rank++;
	// });
}