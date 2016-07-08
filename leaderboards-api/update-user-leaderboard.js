var async = require('async');
var timeFrameCounts = require('./timeframe-counts.js');
var completedGameCount = require('./count-completed-games.js');
var countFunctions = require('./count-functions.js');
var updateRanks = require('./rank-functions.js');
var db = require('../db.js');

module.exports = function(user, topCallback) {
	var userLeaderboards = db.collection('userleaderboards');
	var userAchievements = db.collection('userachievements');
	userLeaderboards.find({ userId: user._id }, function(err, userStat) {
		if (err) {
			topCallback({ reason: 'error retrieving user stats', data: err }, null);
			return;
		}
		if (!userStat) {
			topCallback && topCallback();
			return;
		}
		userAchievements.count({ userId: user._id }, function(err, achiCount) {
			if (err || achiCount < 1) {
				console.log(achiCount);
				console.log('user does not have any achievements ' + user._id);
				topCallback && topCallback();
				return;
			} else {
				async.series([
					function(cb) {
						async.parallel([
							function(callback) {
								console.log('daily count');
								timeFrameCounts.dailyCount(user, function() {
									callback();
								});
							},
							function(callback) {
								console.log('weekly count');
								timeFrameCounts.weeklyCount(user, function() {
									callback();
								});
							},
							function(callback) {
								timeFrameCounts.monthlyCount(user, function() {
									callback();
								});
							},
							function(callback) {
								completedGameCount(user, function() {
									callback();
								});
							},
							function(callback) {
								countFunctions.countTotal(user, function() {
									callback();
								});
							},
							function(callback) {
								countFunctions.countCompleted(user, function() {
									callback();
								});
							},
							function(callback) {
								countFunctions.countByTier(user, function() {
									console.log('tier callback called');
									callback();
								});
							}
						], function(err, result) {
							if (err) {
								console.log('error in finishing counting functions');
								cb(err, null);
								return;
							}
							console.log('all counting functions done');
							cb && cb();
						});
					},
					function(cb) {
						async.parallel([
							function(callback) {
								updateRanks.overallRank(function() {
									//console.log('overall ranks callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.dailyRank(function() {
									//console.log('daily callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.dailyAchievementRank(function() {
									//console.log('daily callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.weeklyRank(function() {
									//console.log('daily callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.weeklyAchievementRank(function() {
									//console.log('daily callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.monthlyRank(function() {
									//console.log('daily callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.monthlyAchievementRank(function() {
									//console.log('daily callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.completedGamesRank(function() {
									//console.log('completed games callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.completedAchievementsRank(function() {
									//console.log('completed achievements callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.totalAchievementsRank(function() {
									//console.log('total achievements callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.commonAchievementsRank(function() {
									//console.log('common achievements callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.rareAchievementsRank(function() {
									//console.log('rare achievements callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.epicAchievementsRank(function() {
									//console.log('epic achievements callback fired');
									callback();
								});
							},
							function(callback) {
								updateRanks.legendaryAchievementsRank(function() {
									//console.log('legendary achievements callback fired');
									callback();
								});
							}
						], function(err, result) {
							if (err) {
								console.log('error in finishing ranking functions');
								cb(err, null);
								return;
							}
							console.log('all ranking functions done');
							var date = new Date();
							userLeaderboards.update({ userId: user._id }, { $set: { updated: date } });
							cb && cb();
						});
					}
				], function(err, results){
					console.log('calling top callback');
					topCallback && topCallback();
				});
			}
		});
	});
}