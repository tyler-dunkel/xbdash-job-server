var randomstring = require("randomstring");
var xboxApiObject = require('./xbox-api.js');
var async = require('async');
var createAndBuild = require('./leaderboards-api/create-and-build.js');
var welcomeEmailSend = require('./mailer-welcome.js');
var db = require('./db.js');

var profileBuilder = function(job, callback) {
	if (job) {
		var userId = job.data.userId;
		var users = db.collection('users');
		console.log(userId);
		users.findOne({_id: userId}, function(err, user) {
			if (!user || !user.xuid) {
				console.log('there is no xuid');
				job.done();
				callback();
				return;
			}

			xboxApiObject.updateGamercard(userId, function(err, res) {
				if (err) {
					console.log('error with update gamercard');
				}
				console.log('update gamercard done, moving to x1');
				xboxApiObject.updateXboxOneData(userId, function(err, res) {
					if (err) {
						console.log('error with update x1 games');
					}
					console.log('update xbox one data done, moving to x360');
					xboxApiObject.updateXbox360Data(userId, function(err, res) {
						if (err) {
							console.log('error with update 360 games');
						}
						console.log('updated x360 data');
						console.log('all jobs done');
						users.update({ _id: userId }, { $set: { 'gamertagScanned.status': "true", 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
							if (err) {
								console.log('error in db update');
							}
							createAndBuild(userId, function(error) {
								if (error) {
									console.log(error);
								}
								job.done && job.done();
								welcomeEmailSend(userId, function(err, result) {
									if (err) {
										console.log('error sending welcome email');
									}
									callback && callback();
									console.log('ending job');
								});
							});
						});
				    });
				});
			});
		});
	}
}

var dirtyUpdateUserStats = function(job, callback) {
	if (job) {
		var users = db.collection('users');
		users.find({ 'gamertagScanned.status': 'true' }).sort({ 'gamertagScanned.lastUpdate': 1 }).limit(20, function(err, userArray) {
			userArray.forEach(function(user) {
				if (user === null) {
					job.done && job.done();
					callback && callback();
					return;
				}
				xboxApiObject.dirtyUpdateUserStats(user._id, function(err) {
					createAndBuild(user._id, function(error) {
						if (error) {
							console.log(error);
						}
					});
				});
			});
		});
	}
}

module.exports = {
	profileBuilder: profileBuilder,
	dirtyUpdateUserStats: dirtyUpdateUserStats
}