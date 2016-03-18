var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';

var db = mongoJS(meteorUrl);

module.exports = function(user, callback) {
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.count({ userId: user._id, progressState: true }, function(err, achiCount) {
		userLeaderboards.update({ userId: user._id }, { $set: { 'completedAchievements.count': achiCount } }, function(err) {
			callback && callback();
		})
	});
}