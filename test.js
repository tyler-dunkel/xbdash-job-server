var db = require('./db.js');
var async = require('async');

var users = db.collection('users');
var userAchievements = db.collection('userachievements');


// users.findOne({_id: 'F5SzyXJiXhEN7pnC8'}, function(err, user) {
// 	console.log(user);				
// });
var theFunc = function(user, callback) {

	var achiFunc = function(achi, callback) {
		userAchievements.find({userId: user._id, achievementId: achi.achievementId}, function(err, userAchiDocs) {
			if (userAchiDocs.length > 1) {
				console.log(achi.achievementId);
				userAchievements.remove({userId: user._id, achievementId: achi.achievementId}, {justOne: true}, function(err) {
					console.log('removed one');
					callback();
				});
			} else {
				console.log('only one');
				callback();
			}
		});
	}
	console.log(user._id);
	userAchievements.find({userId: user._id}).sort({progression: -1}, function(err, docs) {
		async.eachSeries(docs, achiFunc, function(err) {
			console.log('achi done');
			callback();
		});
	});
}

users.find({'gamertagScanned.status': 'true', 'gamercard.gamertag': {$exists: 1}, 'gamercard.gamerscore': {$gt: 0}}).skip(6).sort({createdAt: 1}, function(err, userDocs) {
	async.eachLimit(userDocs, 1, theFunc, function(err) {
		console.log('done with the callbacks');
	});
});

// users.find({_id: 'F5SzyXJiXhEN7pnC8'}, function(err, user) {
// 	console.log(user._id);
// 	// userAchievements.find({userId: user._id}).forEach(function(err, userAchi) {
// 	// 	console.log(userAchi);
// 	// 	userAchievements.find({userId: user._id, achievementId: userAchi.achievementId}, function(err, achis) {
// 	// 		if (achis.count > 1) {
// 	// 			console.log('there are more than one');
// 	// 		}
// 	// 		else {
// 	// 			console.log('just one');
// 	// 		}
// 	// 	});
// 	// });
// });