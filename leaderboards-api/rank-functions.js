var db = require('../db.js');

module.exports = {
	overallRank: function(callback) {
		var rank = 0;
		var users = db.collection('users');
		var userLeaderboards = db.collection('userleaderboards');

		users.find({ 'gamercard.gamerscore': { $gt: 1 } }).sort({ 'gamercard.gamerscore': -1 }).forEach(function(err, userDoc) {
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userDoc) {
				callback && callback();
				return;
			}
			rank++;
			console.log('overall rank is ' + rank);
			userLeaderboards.update({ userId: userDoc._id }, { $set: { 'overallRank': rank } }, function() {
				console.log('overall rank update fired');
			});
		});
	},
	dailyRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'dailyRank.value': { $gte: 1 } }).sort({ 'dailyRank.value': -1 }).forEach(function(err, userStat) { 
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userStat) {
				callback && callback();
				return;
			}
			rank++;
			console.log('daily rank is ' + rank);
			userLeaderboards.update({ userId: userStat.userId }, { $set: { 'dailyRank.rank': rank } }, function() {
				console.log('daily rank update fired');
			});
		});
	},
	completedGamesRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'completedGames.count': { $gte: 1 } }).sort({ 'completedGames.count': -1 }).forEach(function(err, userStat) {
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userStat) {
				callback && callback();
				return;
			}
			rank++;
			console.log('completed games rank is ' + rank);
			userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedGames.rank': rank } }, function() {
				console.log('completed games rank update fired');
			});
		});
	},
	completedAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'completedAchievements.count': { $gte: 1 } }).sort({ 'completedAchievements.count': -1 }).forEach(function(err, userStat) {
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userStat) {
				callback && callback();
				return;
			}
			rank++;
			console.log('completed achievements rank is ' + rank);
			userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedAchievements.rank': rank } }, function() {
				console.log('completed achievements rank update fired');
			});
		});
	},
	totalAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'totalAchievements.count': { $gte: 1 } }).sort({ 'totalAchievements.count': -1 }).forEach(function(err, userStat) {
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userStat) {
				callback && callback();
				return;
			}
			rank++;
			console.log('total achievements rank is ' + rank);
			userLeaderboards.update({ userId: userStat.userId }, { $set: { 'totalAchievements.rank': rank } }, function() {
				console.log('total achievements rank update fired');
			});
		});
	},
	commonAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'commonAchievements.count': { $gte: 1 } }).sort({ 'commonAchievements.count': -1 }).forEach(function(err, userStat) {
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userStat) {
				callback && callback();
				return;
			}
			rank++;
			console.log('common achievements rank is ' + rank);
			userLeaderboards.update({ userId: userStat.userId }, { $set: { 'commonAchievements.rank': rank } }, function() {
				console.log('common achievements rank update fired');
			});
		});
	},
	rareAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'rareAchievements.count': { $gte: 1 } }).sort({ 'rareAchievements.count': -1 }).forEach(function(err, userStat) {
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userStat) {
				callback && callback();
				return;
			}
			rank++;
			console.log('rare achievements rank is ' + rank);
			userLeaderboards.update({ userId: userStat.userId }, { $set: { 'rareAchievements.rank': rank } }, function() {
				console.log('rare achievements rank update fired');
			});
		});
	},
	epicAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'epicAchievements.count': { $gte: 1 } }).sort({ 'epicAchievements.count': -1 }).forEach(function(err, userStat) {
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userStat) {
				callback && callback();
				return;
			}
			rank++;
			console.log('epic achievements rank is ' + rank);
			userLeaderboards.update({ userId: userStat.userId }, { $set: { 'epicAchievements.rank': rank } }, function() {
				console.log('epic achievements rank update fired');
			});
		});
	},
	legendaryAchievementsRank: function(callback) {
		var rank = 0;
		var userLeaderboards = db.collection('userleaderboards');

		userLeaderboards.find({ 'legendaryAchievements.count': { $gte: 1 } }).sort({ 'legendaryAchievements.count': -1 }).forEach(function(err, userStat) {
			if (err) {
				console.log(err);
				callback && callback();
				return;
			}
			if (!userStat) {
				callback && callback();
				return;
			}
			rank++;
			console.log('legendary achievements rank is ' + rank);
			userLeaderboards.update({ userId: userStat.userId }, { $set: { 'legendaryAchievements.rank': rank } }, function() {
				console.log('legendary achievements rank update fired');
			});
		});
	}
}