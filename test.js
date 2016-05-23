// var db = require('./db.js');

// var migrate = function() {
// 	db.collection('xbdjobscollection.jobs').remove({ status: "completed" }, {}, { multi: true }, function(err, res) {
// 		if (err) {
// 			console.log('error removing completed jobs');
// 			callback && callback();
// 			return;
// 		}
// 		console.log('removed completed jobs');
// 	});
// }

// migrate();



// var randomstring = require("randomstring");
// var xboxApiObject = require('./xbox-api.js');
// var async = require('async');
// var createAndBuild = require('./leaderboards-api/create-and-build.js');
// var welcomeEmailSend = require('./mailer-welcome.js');
// var db = require('./db.js');


// var users = db.collection('users');
// var userId = 'CQXDug66fRdxt999A';
// users.findOne({_id: 'CQXDug66fRdxt999A'}, function(err, user) {
// 	if (!user || !user.xuid) {
// 		console.log('there is no xuid');
// 		job.done();
// 		callback();
// 		return;
// 	}
// 	xboxApiObject.updateGamercard(userId, function(err, res) {
// 		if (err) {
// 			console.log('error with update gamercard');
// 			callback && callback();
// 			return;
// 		}
// 		console.log('update gamercard done, moving to x1');
// 		xboxApiObject.updateXboxOneData(userId, function(err, res) {
// 			if (err) {
// 				console.log('error with update x1 games');
// 				callback && callback();
// 				return;
// 			}
// 			console.log('update xbox one data done, moving to x360');
// 			xboxApiObject.updateXbox360Data(userId, function(err, res) {
// 				if (err) {
// 					console.log('error with update 360 games');
// 					callback && callback();
// 					return;
// 				}
// 				console.log('updated x360 data');
// 				users.update({ _id: userId }, { $set: { 'gamertagScanned.status': "true", 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
// 					if (err) {
// 						console.log('error in db update');
// 						callback && callback();
// 						return;
// 					}
// 					createAndBuild(userId, function(err, res) {
// 						if (err) {
// 							console.log(err);
// 							callback && callback();
// 							return;
// 						}
// 						console.log('done creating and building');
// 						job.done && job.done({}, {}, function (err, res) {
// 							if (err) {
// 								console.log('error in ending job');
// 								callback && callback();
// 								return;
// 							}
// 							console.log('all profile build jobs are done');
// 							welcomeEmailSend(userId, function(err, res) {
// 								if (err) {
// 									console.log('error sending welcome email');
// 									callback && callback();
// 									return;
// 								}
// 								callback && callback();
// 								console.log('welcome email sent');
// 							});
// 						});
// 					});
// 				});
// 		    });
// 		});
// 	});
// });

// var xboxApiObject = require('./xbox-api.js');
// var createAndBuild = require('./leaderboards-api/create-and-build.js');
// var db = require('./db.js');

// xboxApiObject.updateXboxOneData('Aga8YoyneRZBD4mJf', function(err, res) {
// 	if (err) {
// 		console.log('error with update x1 games');
// 		callback && callback();
// 		return;
// 	}
// 	console.log('update xbox one data done, moving to x360');
// });

// xboxApiObject.updateXbox360Data('Aga8YoyneRZBD4mJf', function(err, res) {
// 	if (err) {
// 		console.log('error with update 360 games');
// 		callback && callback();
// 		return;
// 	}
// 	console.log('updated x360 data');
// });

// db.collection('users').update({ _id: 'Aga8YoyneRZBD4mJf' }, { $set: { 'gamertagScanned.status': "true", 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
// 	if (err) {
// 		console.log('error in db update');
// 		callback && callback();
// 		return;
// 	}
// 	console.log('lastUpdate updated');
// });

// createAndBuild('Aga8YoyneRZBD4mJf', function(err, res) {
// 	if (err) {
// 		console.log(err);
// 		callback && callback();
// 		return;
// 	}
// 	console.log('done creating and building');
// });