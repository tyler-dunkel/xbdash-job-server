var db = require('../db.js');

module.exports = function(user, callback) {
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.count({ userId: user._id, progressState: true }, function(err, achiCount) {
		userLeaderboards.update({ userId: user._id }, { $set: { 'completedAchievements.count': achiCount } }, function(err) {
			callback && callback();
		})
	});
}