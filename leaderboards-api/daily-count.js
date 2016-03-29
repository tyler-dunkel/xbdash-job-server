var moment = require('moment');
var db = require('../db.js');

module.exports = function(user, callback) {
	var userDailyGamerscore = 0;
	var userLeaderboards = db.collection('userleaderboards');
	var oneDay = moment().startOf('day').toDate();
	var userAchievements = db.collection('userachievements');
	var xbdAchievements = db.collection('xbdachievements');

	userAchievements.count({ userId: user._id, progressState: true, progression: { $gte: oneDay } }, function(err, userAchiCount) {
		if (err) {
			callback && callback();
			return;
		}
		if (!userAchiCount > 0) {
			userLeaderboards.update({ userId: user._id }, { $set: { 'dailyRank.value': 10 } }, function(err) {
				callback && callback();
			});
		} else {
			userAchievements.find({ userId: user._id, progressState: true, progression: { $gte: oneDay } }, function(err, userAchis) {
				userAchis.forEach(function(userAchi, index, array) {
					xbdAchievements.findOne({ _id: userAchi.achievementId }, function(err, doc) {
						userDailyGamerscore += doc.value;
						if (index === array.length - 1) {
							userLeaderboards.update({ userId: user._id }, { $set: { 'dailyRank.value': userDailyGamerscore } }, function (err) {
								callback && callback();
							});
						}
					});
				});
			});
		}
	});
}