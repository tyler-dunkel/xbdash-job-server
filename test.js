
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

console.log(process.env.STATE);

var randomstring = require("randomstring");
var xboxApiObject = require('./xbox-api.js');
var async = require('async');
var createAndBuild = require('./leaderboards-api/create-and-build.js');
var updateBadges = require('./badge-api/badges.js');
var welcomeEmailSend = require('./mailer-welcome.js');
var jobRunToCompleted = require('./settings-reset.js');
var insertNotification = require('./insert-notification');
var _ = require('underscore');
var db = require('./db.js');

// var updateUserLeaderboard = require('./leaderboards-api/update-user-leaderboard.js');
// db.collection('users').findOne({ _id: 'wSeyBTBWGa2oZbdPc' }, function(err, user) {
//     updateUserLeaderboard(user, function(err ,res) {
//         if (err) {
//             console.log(err);
//             return;
//         }
//         console.log(res);
//     });
// });

// var contests = db.collection('xbdcontests');
// var userId = 'numKGua7JywHbnPBS';
// // var msg = 'testing message';
// // insertNotification(userId, msg);

// var id = randomstring.generate(17);
// var obj = {
// 	"_id": id,
//     "status" : "waiting",
//     "rules" : [ 
//         "<strong><em>Get an extra entry</em></strong> into this month's contest for each friend you invite that signs up through your link below.", 
//         "Only <strong><em>verified emails qualify</em></strong> as an entry to this contest.", 
//         "1 grand prize winner will receive a customized controller to their liking with engraving. New Xbox Design Lab controllers ship in September."
//     ],
//     "prizes" : [ 
//         {
//             "title" : "Customized Design Xbox One Controller (by the Xbox&reg; Design Lab)",
//             "imageUrl" : "http://res.cloudinary.com/xbdash/image/upload/v1467373849/contests/new-controller-banner.jpg",
//             "isPremium" : false
//         }
//     ],
//     "contestToken" : "julyDirect",
//     "entries" : [],
//     "startDate" : new Date(),
//     "endDate" : new Date('2016-08-01T03:59:59.000Z'),
//     "awardDate" : new Date('2016-08-01T16:00:00.000Z'),
//     "title" : "July 2016 Custom Xbox&reg; One Controller Contest",
//     "description" : "Xbox&reg; recently released their Xbox&reg; Design Lab! With the Design Lab, you can personalize your controller and they ship in mid-September if orders are placed before the end of August. Get a chance to win a controller of your design courtesy of XBdash!"
// }

// contests.insert(obj);

// notifications.find({}, function(err, docs) {
// 	if (docs) {
// 		var processUser = function(user, cb) {
// 			var temp = _.omit(user, '_id');
// 			var _id = randomstring.generate(17);
// 			var newObj = _.extend(temp, {_id: _id});
// 			notifications.insert(newObj);
// 			notifications.remove({_id: user._id}, {}, function(err) {
// 				cb();
// 			});
// 			// xboxApiObject.updateGamercard("5u9MxfAgqYSwggZXK", function(err) {
// 			// 	if (err) {
// 			// 		console.log(err);
// 			// 	}
// 			// 	cb();
// 			// });
// 			// console.log(user);
// 		}
// 		async.eachSeries(docs, processUser, function(err) {
// 			console.log('done');
// 		});
// 	}
// });
// xboxApiObject.updateScreenShots(userId, function(err) {
// 	console.log('done');
// });
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
// 
// 
var gameDetails = db.collection('gamedetails');
var xbdGames = db.collection('xbdgames');

xbdGames.find({}, function(err, docs) {
	docs.forEach(function(doc) {
		gameDetails.find({gameId: doc._id}).toArray(function(err, gameDetailDocs) {
			if (gameDetailDocs.length > 1) {
				console.log('game has more than one game detail');
				console.log(doc.name);
			}
		});
	});
});
// var users = db.collection('users');
// var userId = 'sZHEe2XfccoJj3p8b';
// users.findOne({_id: userId}, function(err, user) {
// 	if (!user || !user.xuid) {
// 		console.log('there is no xuid');
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
// 						// welcomeEmailSend(userId, function(err, res) {
// 						// 	if (err) {
// 						// 		console.log('error sending welcome email');
// 						// 		return;
// 						// 	}
// 						// 	console.log('welcome email sent');
// 						// });
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
