var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';

var db = mongoJS(meteorUrl);

module.exports = function(user, callback) {
	var commonCount = 0;
	var userAchievements = db.collection('userachievements');
	var xbdAchievements = db.collection('xbdachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.find({ userId: user._id, progressState: true }, function(err, userAchis) {
		if (err) {
			callback && callback();
			return;
		}
		userAchis.forEach(function(userAchi, index, array) {
			xbdAchievements.findOne({ _id: userAchi.achievementId }, function(err, doc) {
				if (doc.userPercentage && doc.userPercentage >= 61) {
					// console.log('common count: ' + doc.userPercentage);
					commonCount++;
				}
				if (index === array.length - 1) {
					userLeaderboards.update({ userId: user._id }, { $set: { 'commonAchievements.count': commonCount } }, function() {
						callback && callback();
					});
				}
			});
		});
	});
}