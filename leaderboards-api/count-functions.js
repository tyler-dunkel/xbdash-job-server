var db = require('../db.js');
var async = require('async');

var countCompleted = function(user, callback) {
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.count({ userId: user._id, progressState: true }, function(err, achiCount) {
		userLeaderboards.update({ userId: user._id }, { $set: { 'completedAchievements.count': achiCount } }, function(err) {
			callback && callback();
		})
	});
}

var countTotal = function(user, callback) {
	var userAchievements = db.collection('userachievements');
	var userLeaderboards = db.collection('userleaderboards');

	userAchievements.count({ userId: user._id }, function(err, achiCount) {
		userLeaderboards.update({ userId: user._id }, { $set: { 'totalAchievements.count': achiCount } }, function(err) {
			callback && callback();
		})
	});
}

var processAcheivement = function(userAchi, asyncCallback) {
	xbdAchievements.findOne({ _id: userAchi.achievementId }, function(err, doc) {
		console.log(doc.userPercentage);
		if (doc.userPercentage) {
			if (doc.userPercentage >= 1 && doc.userPercentage <= 10) {
				console.log('legendary plus one');
				legendaryCount++;
			}
			else if (doc.userPercentage >= 31 && doc.userPercentage <= 60) {
				console.log('rare plus one');
				rareCount++;
			}
			else if (doc.userPercentage >= 11 && doc.userPercentage <= 30) {
				console.log('epic plus one');
				epicCount++;
			}
			else if (doc.userPercentage && doc.userPercentage >= 61) {
				console.log('common plus one');
				commonCount++;
				//commonCount = commonCount + 1;
			}
		}
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
			//console.log(doc.userPercentage);
			if (doc.userPercentage) {
				if (doc.userPercentage >= 1 && doc.userPercentage <= 10) {
					//console.log('legendary plus one');
					legendaryCount++;
					asyncCallback();
				}
				else if (doc.userPercentage >= 31 && doc.userPercentage <= 60) {
					//console.log('rare plus one');
					rareCount++;
					asyncCallback();
				}
				else if (doc.userPercentage >= 11 && doc.userPercentage <= 30) {
					//console.log('epic plus one');
					epicCount++;
					asyncCallback();
				}
				else if (doc.userPercentage && doc.userPercentage >= 61) {
					//console.log('common plus one');
					commonCount++;
					asyncCallback();
					//commonCount = commonCount + 1;
				}
			} else {
				asyncCallback();
			}
		});
	}

	var q = async.queue(processAcheivement, 1);

	userAchievements.find({ userId: user._id, progressState: true }).forEach(function(err, userAchi) {
		console.log('user achievement is: ' + !!userAchi);
		console.log(user._id);
		if (!userAchi) {
			return;
		}
		q.push(userAchi, function(err) {
		});
	});

	q.drain = function() {
		console.log('draining the queue for achievement leaderbaord');
		console.log("common count is: " + commonCount + " Legendary Count is: " + legendaryCount);
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