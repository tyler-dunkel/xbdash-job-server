var DDP = require('ddp');
var Job = require('meteor-job');
var DDPlogin = require('ddp-login');
var randomstring = require("randomstring");
var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiObject = require('./xbox-api.js');
var workers = require('./workers.js');
var async = require('async');

var db = mongoJS(meteorUrl);

// xboxApiObject.updateXboxOneData('G7P77WqDsCuYjbvQG', function (err, res) {
// 	if (err) {
// 		console.log(JSON.stringify(err));
// 		return;
// 	}
// 	console.log('xbox one updated');
// });

// xboxApiObject.updateXbox360Data('G7P77WqDsCuYjbvQG', function (err, res) {
// 	if (err) {
// 		console.log(JSON.stringify(err));
// 		return;
// 	}
// 	console.log('xbox 360 updated');
// });

// xboxApiObject.dirtyUpdateUserStats('mMk9BBNF6deJGjMBu', function (err, res) {
// 	if (err) {
// 		console.log(JSON.stringify(err));
// 		return;
// 	}
// 	if (res) {
// 		console.log(res);
// 	}
// });

var ddp = new DDP({
	host: "127.0.0.1",
	port: 3000,
	use_ejson: true
});

Job.setDDP(ddp);

ddp.connect(function (err) {
	if (err) throw err;
	DDPlogin(ddp, function (err, token) {
		if (err) {
			db.close();
			throw err;
		}

		var buildUserProfileWorker = Job.processJobs('xbdjobscollection', 'buildUserProfileJob', workers.profileBuilder);

		// var checkGamesWorker = Job.processJobs('xbdjobscollection', 'checkGamesJob', function (job, callback) {
		// 	if (job) {
		// 		if (err) throw err;

		// 		var userGames = db.collection('usergames');
		// 		var xbdGame = db.collection('xbdgames');

		// 		userGames.find({ completed: false }).pipe(function(game) {
		// 			console.log(game);
		// 		});

		// 		pipe.on('data', function(doc) {
		// 			xbdGame.findOne({ _id: doc.gameId }, {}, function(err, game) {
		// 				if (err) throw err;
		// 				console.log(game.name + ' is not complete');
		// 				if (doc.currentGamerscore === game.maxGamerscore) {
		// 					userGames.updateOne({ _id: game._id }, { $set: { completed: true } });
		// 				}
		// 			});
		// 		});

		// 		pipe.on('end', function() {
		// 			console.log('pipe is done');
		// 			job.done();
		// 			callback();
		// 		});
		// 	}
		// });

		//var checkAchievementsWorker = Job.processJobs('xbdjobscollection', 'checkAchievementsJob', achievementWorker);
	});
});