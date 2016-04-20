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
					callback && callback();
					return;
				}
				console.log('update gamercard done, moving to x1');
				xboxApiObject.updateXboxOneData(userId, function(err, res) {
					if (err) {
						console.log('error with update x1 games');
						callback && callback();
						return;
					}
					console.log('update xbox one data done, moving to x360');
					xboxApiObject.updateXbox360Data(userId, function(err, res) {
						if (err) {
							console.log('error with update 360 games');
							callback && callback();
							return;
						}
						console.log('updated x360 data');
						users.update({ _id: userId }, { $set: { 'gamertagScanned.status': "true", 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
							if (err) {
								console.log('error in db update');
								callback && callback();
								return;
							}
							createAndBuild(userId, function(err, res) {
								if (err) {
									console.log(err);
									callback && callback();
									return;
								}
								console.log('done creating and building');
								job.done && job.done({}, {}, function (err, res) {
									if (err) {
										console.log('error in ending job');
										callback && callback();
										return;
									}
									welcomeEmailSend(userId, function(err, res) {
										if (err) {
											console.log('error sending welcome email');
											callback && callback();
											return;
										}
										callback && callback();
										console.log('welcome email sent');
									});
									console.log('all profile build jobs done');
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
		var processUser = function(user, asyncCb) {
			xboxApiObject.dirtyUpdateUserStats(user._id, function(err, res) {
				if (err) {
					console.log('error on xbox api dirty user update');
					asyncCb && asyncCb();
					return;
				}
				createAndBuild(user._id, function(err, res) {
					if (err) {
						console.log(err);
						asyncCb && asyncCb();
						return;
					}
					console.log('calling async cb');
					asyncCb && asyncCb();
				});
			});
		}
		var q = async.queue(processUser, 1);
		// change back later***
		users.find({ 'gamertagScanned.status': 'true', 'gamercard.gamerscore': { $gt: 0 } }).sort({ 'gamertagScanned.lastUpdate': 1 }).limit(5).forEach(function(err, user) {
			if (!user || !user.gamercard) {
				return;
			}
			q.push(user, function(err) {

			});
			console.log('user: ' + user.gamercard.gamertag + ' started');
		});
		q.drain = function(err) {
			console.log('queue drained');
			job.done("dirty user job is done");
			callback && callback();
		}
	}
}

var clearDailyRanks = function(job, callback) {
	if (job) {
		var userLeaderboards = db.collection('userleaderboards');
		userLeaderboards.update({}, { $set: { 'dailyRank.value': 0, 'dailyRank.rank': 0 } }, { multi: true },
			function(err) {
				if (err) {
					console.log(err);
				}
				console.log('daily ranks cleared');
				callback && callback();
			});
	}
}

module.exports = {
	profileBuilder: profileBuilder,
	dirtyUpdateUserStats: dirtyUpdateUserStats,
	clearDailyRanks: clearDailyRanks
}