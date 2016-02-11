var randomstring = require("randomstring");
var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiObject = require('./xbox-api.js');

var db = mongoJS(meteorUrl);

var achievementCheck = function (job, callback) {
	if (job) {

		var users = db.collection('users').find({ xuid: { $exists: true } }, { timeout: false });
		var userAchievements = db.collection('userachievements');
		var xbdAchievements = db.collection('xbdachievements');

		users.count(function(err, userCount) {
			if (err) throw err;

			stream.on('data', function(doc) {
				console.log('running job for: ' + doc.name);
				userAchievements.find({ achievementId: doc._id, progressState: true }).count(function(err, achiCount) {
					if (err) throw err;
					var achievementUnlockPercentage = Math.round((achiCount/userCount) * 100);
					xbdAchievements.updateOne({ _id: doc._id }, {$set: { userPercentage: achievementUnlockPercentage }});
				});
			});

			stream.on('end', function() {
				console.log('achi job is done');
				job.done();
				callback();
			});
		});
	}
}

var profileBuilder = function(job, callback) {
	if (job) {
		var userId = job.data.userId;
		var users = db.collection('users');
		users.findOne({_id: userId}, function(err, user) {
			if (!user || !user.xuid) {
				console.log('there is no xuid');
				job.done();
				callback();
			}
			xboxApiObject.updateGamercard(userId, function(err, res) {
				if (err) {
					console.log('error with update gamercard');
				}
				xboxApiObject.updateXboxOneData(userId, function(err, res) {
					if (err) {
						console.log('error with update x1 games');
					}
					xboxApiObject.updateXbox360Data(userId, function(err, res) {
						if (err) {
							console.log('error with update 360 games');
						}
						console.log('all jobs done');
					});
				});
			});
		});
		users.update({_id: userId}, {$set: {'gamertagScanned.status': "true", 'gamertagScanned.lastUpdate': new Date()}}, function(err, res) {
			if (err) {
				console.log('error in db update');
			}
		});
		job.done();
		callback();
	}
}

module.exports = {
	profileBuilder: profileBuilder,
	achievementCheck: achievementCheck
}