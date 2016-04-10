var async = require('async');
var dailyCount = require('./daily-count.js');
var completedGameCount = require('./count-completed-games.js');
var completedAchievementCount = require('./count-completed-achievements.js');
var totalAchievementCount = require('./count-total-achievements.js');
var commonAchievementsCount = require('./count-common-achievements.js');
var rareAchievementsCount = require('./count-rare-achievements.js');
var epicAchievementsCount = require('./count-epic-achievements.js');
var legendaryAchievementsCount = require('./count-legendary-achievements.js');
var updateRanks = require('./rank-functions.js');
var db = require('../db.js');

module.exports = function(user, topCallback) {
	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ userId: user._id }, function(err, userStat) {
		if (err) {
			topCallback({ reason: 'error retrieving user stats', data: err }, null);
			return;
		}
		if (!userStat) {
			topCallback && topCallback();
			return;
		}
		async.series([
			function(cb) {
				async.parallel([
					function(callback) {
						dailyCount(user, function() {
							callback();
						});
					},
					function(callback) {
						completedGameCount(user, function() {
							callback();
						});
					},
					function(callback) {
						completedAchievementCount(user, function() {
							callback();
						});
					},
					function(callback) {
						totalAchievementCount(user, function() {
							callback();
						});
					},
					function(callback) {
						commonAchievementsCount(user, function() {
							callback();
						});
					},
					function(callback) {
						rareAchievementsCount(user, function() {
							callback();
						});
					},
					function(callback) {
						epicAchievementsCount(user, function() {
							callback();
						});
					},
					function(callback) {
						legendaryAchievementsCount(user, function() {
							callback();
						});
					}
				], function(err, result) {
					if (err) {
						cb(err, null);
						console.log('error in finishing counting functions');
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
						cb(err, null);
						console.log('error in finishing ranking functions');
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
	});
}