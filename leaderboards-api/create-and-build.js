var moment = require('moment');
var randomstring = require("randomstring");
var updateUserLeaderboard = require('./update-user-leaderboard.js');
var db = require('../db.js');

module.exports = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('userId is not a string');
		callback && callback(err, null);
		return;
	}

	var users = db.collection('users');
	var userLeaderboards = db.collection('userleaderboards');

	console.log('create and build leaderboards entry');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'error retrieving user', data: err });
			return;
		}
		if (!user || !user.gamertagScanned) {
			console.log('error - not a user or gamertag was not scanned');
			callback();
			return;
		}
		if (user.gamertagScanned.status === 'false' || user.gamertagScanned.status === 'building') {
			console.log('gamertag is false or building');
			callback && callback();
			return;
		}
		userLeaderboards.count({ userId: userId }, function(err, userCount) {
			if (err) {
				callback({ reason: 'error retrieving user', data: err });
				return;
			}
			console.log('counting leaderboards');
			if (userCount < 1) {
				var userStats = {
					_id: randomstring.generate(17),
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
				console.log('inserting user in leaderboards');
				userLeaderboards.insert(userStats);
			}
			updateUserLeaderboard(user, function() {
				console.log('leaderboards updated');
				callback && callback();
			});
		});
	});
}