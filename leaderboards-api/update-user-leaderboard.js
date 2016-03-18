var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var moment = require('moment');
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

var db = mongoJS(meteorUrl);

module.exports = function(user, callback) {
	var userLeaderboards = db.collection('userleaderboards');

	userLeaderboards.find({ userId: user._id }, function(err, userStat) {
		if (err) {
			callback({ reason: 'error retrieving user stats', data: err }, null);
			return;
		}
		if (!userStat) {
			callback && callback();
			return;
		}

		async.parallel([
			function(callback) {
				console.log('calling user daily gamerscore count');
				dailyCount(user, function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling completed games count');
				completedGameCount(user, function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling completed achievements count');
				completedAchievementCount(user, function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling total achievements count');
				totalAchievementCount(user, function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling common achievements count');
				commonAchievementsCount(user, function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling rare achievements count');
				rareAchievementsCount(user, function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling epic achievements count');
				epicAchievementsCount(user, function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling legendary achievements count');
				legendaryAchievementsCount(user, function() {
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
			userLeaderboards.update({ userId: user._id }, { $set: { updated: date } });
			callback && callback();
		});

		async.parallel([
			function(callback) {
				console.log('calling user daily ranks');
				updateRanks.dailyRank(function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling completed games rank');
				updateRanks.completedGamesRank(function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling completed achievements rank');
				updateRanks.completedAchievementsRank(function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling total achievements rank');
				updateRanks.totalAchievementsRank(function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling common achievements rank');
				updateRanks.commonAchievementsRank(function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling rare achievements rank');
				updateRanks.rareAchievementsRank(function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling epic achievements rank');
				updateRanks.epicAchievementsRank(function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling legendary achievements rank');
				updateRanks.legendaryAchievementsRank(function() {
					callback();
				});
			},
			function(callback) {
				console.log('calling overall ranks');
				updateRanks.overallRank(function() {
					callback();
				});
			}
		], function(err, result) {
			if (err) {
				callback(err, null);
				console.log('error in finishing ranking functions');
				return;
			}
			console.log('all ranking functions done');
			var date = moment().format();
			userLeaderboards.update({ userId: user._id }, { $set: { updated: date } });
			callback && callback();
		});
	});
}