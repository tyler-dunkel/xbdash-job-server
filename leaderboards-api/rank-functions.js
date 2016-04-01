var db = require('../db.js');

module.exports = {
	overallRank: function(callback) {
		var rank = 0;
		var users = db.collection('users');
		var userLeaderboards = db.collection('userleaderboards');

		users.find({ 'gamercard.gamerscore': { $gt: 1 } }).sort({ 'gamercard.gamerscore': -1 }, function(err, user) {
			if (err) return;
			if (!user) return;
			user.forEach(function(user, index, array) {
				rank++;
				userLeaderboards.update({ userId: user._id }, { $set: { 'overallRank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	},
	dailyRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'dailyRank.value': { $gte: 1 } }).sort({ 'dailyRank.value': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				rank++;
				userLeaderboards.update({ userId: userStat.userId }, { $set: { 'dailyRank.rank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	},
	completedGamesRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'completedGames.count': { $gte: 1 } }).sort({ 'completedGames.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				rank++;
				userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedGames.rank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	},
	completedAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'completedAchievements.count': { $gte: 1 } }).sort({ 'completedAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				rank++;
				userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedAchievements.rank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	},
	totalAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'totalAchievements.count': { $gte: 1 } }).sort({ 'totalAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				rank++;
				userLeaderboards.update({ userId: userStat.userId }, { $set: { 'totalAchievements.rank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	},
	commonAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'commonAchievements.count': { $gte: 1 } }).sort({ 'commonAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				rank++;
				userLeaderboards.update({ userId: userStat.userId }, { $set: { 'commonAchievements.rank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	},
	rareAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'rareAchievements.count': { $gte: 1 } }).sort({ 'rareAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				rank++;
				userLeaderboards.update({ userId: userStat.userId }, { $set: { 'rareAchievements.rank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	},
	epicAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'epicAchievements.count': { $gte: 1 } }).sort({ 'epicAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				rank++;
				userLeaderboards.update({ userId: userStat.userId }, { $set: { 'epicAchievements.rank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	},
	legendaryAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'legendaryAchievements.count': { $gte: 1 } }).sort({ 'legendaryAchievements.count': -1 }, function(err, userStats) {
			userStats.forEach(function(userStat, index, array) {
				rank++;
				userLeaderboards.update({ userId: userStat.userId }, { $set: { 'legendaryAchievements.rank': rank } }, function() {
					if (index === array.length - 1) {
						callback && callback();
					}
				});
			});
		});
	}
}