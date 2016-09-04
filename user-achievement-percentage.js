var db = require('./db.js');

module.exports = function(achievement, cb) {
	db.collection('userachievements').count({achievementId: achievement._id, progressState: true}, function(err, userAchievementCount) {
		db.collection('xbdgames').findOne({_id: achievement.gameId}, function(err, doc) {
			if (err) {
				console.log('error finding xbox game in user achi func');
				console.log(err);
				cb();
				return;
			}
			db.collection('usergames').count({gameId: doc._id}, function(err, userGamesCount) {
				if (userGamesCount < 1) {
					console.log('no user games in acheivement func');
					cb();
					return;
				}
				var achievementUnlockPercentage = Math.round((userAchievementCount/userGamesCount) * 100);
				if (achievementUnlockPercentage > 100) {
					achievementUnlockPercentage = 100;
				}

				db.collection('xbdachievements').update({_id: achievement._id}, { $set: {userPercentage: achievementUnlockPercentage}}, function(err) {
					if (err) {
						console.log(err);
					}
					cb();
				});
			});
		});
	});
}