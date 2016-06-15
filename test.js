
// var db = require('./db.js');

// var users = db.collection('users');

// doIt(function(err, user) {

// })

// var hello = red;

//  users.find({_id: 'F5SzyXJiXhEN7pnC8'}).sort({ 'gamertagScanned.lastUpdate': 1 }).limit(5).toArray(function(err, docs) {
//  	docs.forEach(function(user) {
//  		users.update({_id: user._id}, {$set: {'gamertagScanned.status': 'true'}}, function() {
//  			console.log('updated user');
//  		})
//  	});
//  });
// var async = require('async');

// var users = db.collection('users');
// var userAchievements = db.collection('userachievements');
// var db = require('./db.js');
// var async = require('async');

// var users = db.collection('users');
// var userAchievements = db.collection('userachievements');

// var theFunc = function(user, callback) {

// 	var achiFunc = function(achi, callback) {
// 		userAchievements.find({ userId: user._id, achievementId: achi.achievementId }, function(err, userAchiDocs) {
// 			if (userAchiDocs.length > 1) {
// 				console.log(achi.achievementId);
// 				userAchievements.remove({ userId: user._id, achievementId: achi.achievementId }, { justOne: true }, function(err) {
// 					console.log('removed one');
// 					callback();
// 				});
// 			} else {
// 				console.log('only one');
// 				callback();
// 			}
// 		});
// 	}
// 	console.log(user._id);
// 	userAchievements.find({ userId: user._id}).sort({ progression: -1 }, function(err, docs) {
// 		async.eachSeries(docs, achiFunc, function(err) {
// 			console.log('achi done');
// 			callback();
// 		});
// 	});
// }

// // users.findOne({_id: 'F5SzyXJiXhEN7pnC8'}, function(err, user) {
// // 	console.log(user);				
// // });
// var theFunc = function(user, callback) {

// 	var achiFunc = function(achi, callback) {
// 		userAchievements.find({userId: user._id, achievementId: achi.achievementId}, function(err, userAchiDocs) {
// 			if (userAchiDocs.length > 1) {
// 				console.log(achi.achievementId);
// 				userAchievements.remove({userId: user._id, achievementId: achi.achievementId}, {justOne: true}, function(err) {
// 					console.log('removed one');
// 					callback();
// 				});
// 			} else {
// 				console.log('only one');
// 				callback();
// 			}
// 		});
// 	}
// 	console.log(user._id);
// 	userAchievements.find({userId: user._id}).sort({progression: -1}, function(err, docs) {
// 		async.eachSeries(docs, achiFunc, function(err) {
// 			console.log('achi done');
// 			callback();
// 		});
// 	});
// }

// users.find({'gamertagScanned.status': 'true', 'gamercard.gamertag': {$exists: 1}, 'gamercard.gamerscore': {$gt: 0}}).skip(40).sort({'gamercard.gamerscore': 1}, function(err, userDocs) {
// users.find({ 'gamertagScanned.status': 'true', 'gamercard.gamertag': { $exists: 1 }, 'gamercard.gamerscore': { $gt: 0 } }).skip(5).sort({ 'gamercard.gamerscore': -1 }, function(err, userDocs) {
// 	async.eachLimit(userDocs, 1, theFunc, function(err) {
// 		console.log('done with the callbacks');
// 	});
// });

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

var randomstring = require("randomstring");
var xboxApiObject = require('./xbox-api.js');
var async = require('async');
var createAndBuild = require('./leaderboards-api/create-and-build.js');
var welcomeEmailSend = require('./mailer-welcome.js');
var jobRunToCompleted = require('./settings-reset.js');
var db = require('./db.js');


jobRunToCompleted(function(err) {
	console.log(err);
	console.log('done');
});

// var users = db.collection('users');
// var userId = 'jJACJFbadj7nKX2Di';
// createAndBuild(userId, function (err, res) {
// 	if (err) {
// 		console.log(err);
// 		return;
// 	}
// 	console.log('done creating and building');

// 	console.log('all profile build jobs are done');
// 	welcomeEmailSend(userId, function (err, res) {
// 		if (err) {
// 			console.log('error sending welcome email');
// 			return;
// 		}
// 		console.log('welcome email sent');
// 	});
// });
// users.findOne({_id: userId}, function(err, user) {
// 	if (!user || !user.xuid) {
// 		console.log('there is no xuid');
// 		job.done();
// 		callback();
// 		return;
// 	}
// 	xboxApiObject.updateGamercard(userId, function(err, res) {
// 		if (err) {
// 			console.log('error with update gamercard');
// 			return;
// 		}
// 		console.log('update gamercard done, moving to x1');
// 		xboxApiObject.updateXboxOneData(userId, function(err, res) {
// 			if (err) {
// 				console.log('error with update x1 games');
// 				return;
// 			}
// 			console.log('update xbox one data done, moving to x360');
// 			xboxApiObject.updateXbox360Data(userId, function(err, res) {
// 				if (err) {
// 					console.log('error with update 360 games');
// 					return;
// 				}
// 				console.log('updated x360 data');
// 				users.update({ _id: userId }, { $set: { 'gamertagScanned.status': "true", 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
// 					if (err) {
// 						console.log('error in db update');
// 						return;
// 					}
// 					createAndBuild(userId, function(err, res) {
// 						if (err) {
// 							console.log(err);
// 							return;
// 						}
// 						console.log('done creating and building');

// 						console.log('all profile build jobs are done');
// 						welcomeEmailSend(userId, function(err, res) {
// 							if (err) {
// 								console.log('error sending welcome email');
// 								return;
// 							}
// 							console.log('welcome email sent');
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
