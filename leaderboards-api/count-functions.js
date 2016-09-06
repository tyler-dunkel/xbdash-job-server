var db = require('../db.js');
var async = require('async');

var countCompleted = function(user, callback) {
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.count({ userId: user._id, progressState: true }, function(err, achiCount) {
		userLeaderboards.update({ userId: user._id }, { $set: { 'completedAchievements.count': achiCount } }, function(err) {
			callback && callback();
		});
	});
}

var countTotal = function(user, callback) {
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.count({ userId: user._id }, function(err, achiCount) {
		userLeaderboards.update({ userId: user._id }, { $set: { 'totalAchievements.count': achiCount } }, function(err) {
			callback && callback();
		});
	});
}

var countByTier = function(user, callback) {
	var epicCount = 0,
		commonCount = 0,
		rareCount = 0,
		legendaryCount = 0,
	 	userAchievements = db.collection('userachievements'),
		xbdAchievements = db.collection('xbdachievements'),
		userLeaderboards = db.collection('userleaderboards');

	var processAcheivement = function(userAchi, asyncCallback) {
		xbdAchievements.findOne({ _id: userAchi.achievementId }, function(err, doc) {
			if (doc && !isNaN(doc.userPercentage)) {
				if (doc.userPercentage >= 0 && doc.userPercentage <= 10) {
					legendaryCount++;
					asyncCallback();
				}
				else if (doc.userPercentage >= 31 && doc.userPercentage <= 60) {
					rareCount++;
					asyncCallback();
				}
				else if (doc.userPercentage >= 11 && doc.userPercentage <= 30) {
					epicCount++;
					asyncCallback();
				}
				else if (doc.userPercentage && doc.userPercentage >= 61) {
					commonCount++;
					asyncCallback();
					//commonCount = commonCount + 1;
				} else {
					asyncCallback();
				}
			} else {
				console.log('this achievement has no user percentage and could be a challenge');
				console.log(doc);
				asyncCallback();
			}
		});
	}

	var q = async.queue(processAcheivement, 1);

	userAchievements.find({ userId: user._id, progressState: true }).forEach(function(err, userAchi) {
		if (!userAchi) {
			return;
		}
		q.push(userAchi, function(err) {
		});
	});

	q.drain = function() {
		console.log("ending the achievement count functions for + " + user._id);
		userLeaderboards.update({ userId: user._id }, { $set: { 'legendaryAchievements.count': legendaryCount, 
			'commonAchievements.count': commonCount, 'epicAchievements.count': epicCount, 'rareAchievements.count': rareCount }
			 }, function() {
			callback && callback();
		});
	}
}

module.exports = {
	countByTier: countByTier,
	countTotal: countTotal,
	countCompleted: countCompleted
}