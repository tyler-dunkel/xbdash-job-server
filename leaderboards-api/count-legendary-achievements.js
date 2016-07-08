// var db = require('../db.js');

// module.exports = function(user, callback) {
// 	var legendaryCount = 0;
// 	var userAchievements = db.collection('userachievements');
// 	var xbdAchievements = db.collection('xbdachievements');
// 	var userLeaderboards = db.collection('userleaderboards');

// 	userAchievements.find({ userId: user._id, progressState: true }, function(err, userAchis) {
// 		if (err) {
// 			callback && callback();
// 			return;
// 		}
// 		userAchis.forEach(function(userAchi, index, array) {
// 			xbdAchievements.findOne({ _id: userAchi.achievementId }, function(err, doc) {
// 				if (doc.userPercentage && (doc.userPercentage >= 1 && doc.userPercentage <= 10)) {
// 					legendaryCount++;
// 				}
// 				if (index === array.length - 1) {
// 					userLeaderboards.update({ userId: user._id }, { $set: { 'legendaryAchievements.count': legendaryCount } }, function() {
// 						callback && callback();
// 					});
// 				}
// 			});
// 		});
// 	});
// }