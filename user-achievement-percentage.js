var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var async = require('async');

var db = mongoJS(meteorUrl);

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