var DDP = require('ddp');
var Job = require('meteor-job');
var DDPlogin = require('ddp-login');
var Client = require('mongodb').MongoClient
var format = require('util').format;
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiCaller = require('xbox-api/xbox-api-caller');

var gameUrl = '2533274805933072/gamercard';

xboxApiCaller(gameUrl, function(err, res) {
	if (err) {
		console.log(err);
		throw err;
	}
	if (res) {
		console.log(res);
	}
});

// var ddp = new DDP({
// 	host: "127.0.0.1",
// 	port: 3000,
// 	use_ejson: true
// });

// Job.setDDP(ddp);

// ddp.connect(function (err) {
// 	if (err) throw err;
// 	Client.connect(meteorUrl, function (err, db) {
// 		DDPlogin(ddp, function (err, token) {
// 			if (err) {
// 				db.close();
// 				throw err;
// 			};

// 			var checkGamesWorker = Job.processJobs('xbdjobscollection', 'checkGamesJob', function (job, callback) {
// 				if (job) {
// 					if (err) throw err;

// 					var userGames = db.collection('usergames');
// 					var xbdGame = db.collection('xbdgames');
// 					var stream = userGames.find({ completed: false }).stream();

// 					userGames.find({ completed: false }, { timeout: false }).count(function(err, count) {
// 						if (err) throw err;
// 						if (count < 1) return;
// 					});

// 					stream.on('data', function(doc) {
// 						xbdGame.findOne({ _id: doc.gameId }, {}, function(err, game) {
// 							if (err) throw err;
// 							console.log(game.name + ' is not complete');
// 							if (doc.currentGamerscore === game.maxGamerscore) {
// 								userGames.updateOne({ _id: game._id }, { $set: { completed: true } });
// 							}
// 						});
// 					});

// 					stream.on('end', function() {
// 						console.log('stream is done');
// 						job.done();
// 						callback();
// 					});
// 				}
// 			});

// 			var checkAchievementsWorker = Job.processJobs('xbdjobscollection', 'checkAchievementsJob', function (job, callback) {
// 				if (job) {
// 					if (err) throw err;

// 					var users = db.collection('users').find({ xuid: { $exists: true } }, { timeout: false });
// 					var userAchievements = db.collection('userachievements');
// 					var xbdAchievements = db.collection('xbdachievements');
// 					var stream = xbdAchievements.find({}).stream();

// 					users.count(function(err, userCount) {
// 						if (err) throw err;

// 						stream.on('data', function(doc) {
// 							console.log('running job for: ' + doc.name);
// 							userAchievements.find({ achievementId: doc._id, progressState: true }).count(function(err, achiCount) {
// 								if (err) throw err;
// 								var achievementUnlockPercentage = Math.round((achiCount/userCount) * 100);
// 								xbdAchievements.updateOne({ _id: doc._id }, {$set: { userPercentage: achievementUnlockPercentage }});
// 							});
// 						});

// 						stream.on('end', function() {
// 							console.log('achi job is done');
// 							job.done();
// 							callback();
// 						});
// 					});
// 				}
// 			});
// 		});
// 	});
// });