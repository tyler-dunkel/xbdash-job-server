var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';

var db = mongoJS(meteorUrl);

module.exports = {
	overallRank: function(callback) {
		var userOverallRank = 1;
		var users = db.collection('users');
		var userLeaderboards = db.collection('userleaderboards');

		users.find({ 'gamercard.gamerscore': { $gt: 1 } }).sort({ 'gamercard.gamerscore': -1 }, function(err, user) {
			if (err) return;
			if (!user) return;
			user.forEach(function(err, user) {
				userLeaderboards.update({ userId: user._id }, { $set: { 'overallRank': userOverallRank } }, function() {
					callback && callback();
				});
				userOverallRank++;
			});
		});
	},
	dailyRank: function(callback) {
		var userDailyRank = 1;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'dailyRank.value': { $gt: 1 } }).sort({ 'dailyRank.value': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: userStat.userId }, { $set: { 'dailyRank.rank': userDailyRank } }, function() {
						callback && callback();
					});
				}
				userDailyRank++;
			});
		});
	},
	completedGamesRank: function(callback) {
		var rank = 1;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'completedGames.count': { $gte: 1 } }).sort({ 'completedGames.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedGames.rank': rank } }, function() {
						callback && callback();
					});
				}
				rank++;
			});
		});
	},
	completedAchievementsRank: function(callback) {
		var rank = 1;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'completedAchievements.count': { $gte: 1 } }).sort({ 'completedAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedAchievements.rank': rank } }, function() {
						callback && callback();
					});
				}
				rank++;
			});
		});
	},
	totalAchievementsRank: function(callback) {
		var rank = 1;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'totalAchievements.count': { $gte: 1 } }).sort({ 'totalAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: userStat.userId }, { $set: { 'totalAchievements.rank': rank } }, function() {
						callback && callback();
					});
				}
				rank++;
			});
		});
	},
	commonAchievementsRank: function(callback) {
		var rank = 1;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'commonAchievements.count': { $gte: 1 } }).sort({ 'commonAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: userStat.userId }, { $set: { 'commonAchievements.rank': rank } }, function() {
						callback && callback();
					});
				}
				rank++;
			});
		});
	},
	rareAchievementsRank: function(callback) {
		var rank = 1;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'rareAchievements.count': { $gte: 1 } }).sort({ 'rareAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: userStat.userId }, { $set: { 'rareAchievements.rank': rank } }, function() {
						callback && callback();
					});
				}
				rank++;
			});
		});
	},
	epicAchievementsRank: function(callback) {
		var rank = 1;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'epicAchievements.count': { $gte: 1 } }).sort({ 'epicAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: userStat.userId }, { $set: { 'epicAchievements.rank': rank } }, function() {
						callback && callback();
					});
				}
				rank++;
			});
		});
	},
	legendaryAchievementsRank: function(callback) {
		var rank = 1;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'legendaryAchievements.count': { $gte: 1 } }).sort({ 'legendaryAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: userStat.userId }, { $set: { 'legendaryAchievements.rank': rank } }, function() {
						callback && callback();
					});
				}
				rank++;
			});
		});
	}
}