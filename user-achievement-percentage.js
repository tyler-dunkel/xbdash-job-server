var db = require('./db.js');

module.exports = function(achievementId, cb) {
	var users = db.collection('users').count({ xuid: { $exists: true }}, function(err, userCount) {
		if (userCount < 0) {
			cb && cb('no users', null);
			return;
		}
		db.collection('userachievements').count({achievementId: achievementId, progressState: true}, function(err, userAchievementCount) {
			if (err) {
				cb && cb('no acheivements error', null);
				return;
			}
			var achievementUnlockPercentage = Math.round((userAchievementCount/userCount) * 100);
			db.collection('xbdachievements').update({_id: achievementId}, {$set: {userPercentage: achievementUnlockPercentage}}, function(err, doc) {
				if (err) {
					cb && cb(err, null);
					return;
				}
				cb && cb();
			});
		});
	});
}