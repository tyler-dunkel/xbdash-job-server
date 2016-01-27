var DDP = require('ddp');
var Job = require('meteor-job');
var DDPlogin = require('ddp-login');
var Client = require('mongodb').MongoClient
var format = require('util').format;
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';

var ddp = new DDP({
	host: "127.0.0.1",
	port: 3000,
	use_ejson: true
});

Job.setDDP(ddp);

ddp.connect(function (err) {
	if (err) throw err;
	DDPlogin(ddp, function (err, token) {
		if (err) throw err;
		var checkGamesWorker = Job.processJobs('xbdjobscollection', 'checkGamesJob', function (job, db) {
			if (job) {
				Client.connect(meteorUrl, function (err, db) {
					if (err) throw err;

					var userGames = db.collection('usergames');
					var xbdGame = db.collection('xbdgames');

					userGames.find({ completed: false }).count(function(err, count) {
						if (err) throw err;
						if (count < 1) return;
					});
					userGames.find({ completed: false }).each(function(err, game) {
						if (game == null) {
							db.close();
							job.done();
							return;
						}
						xbdGame.findOne({ _id: game.gameId }, {}, function(err, doc) {
							if (err) throw err;
							if (game.currentGamerscore === doc.maxGamerscore) {
								userGames.updateOne({ _id: game._id }, { $set: { completed: true } });
							}
						});
					});
				});
			}
		});

		var checkAchievementsWorker = Job.processJobs('xbdjobscollection', 'checkAchievementsJob', function (job, db) {
			if (job) {
				Client.connect(meteorUrl, function (err, db) {
					if (err) throw err;

					var users = db.collection('users').find({ xuid: { $exists: true } });
					var userAchievements = db.collection('userachievements');
					var xbdAchievements = db.collection('xbdachievements');

					users.count(function(err, userCount) {
						if (err) throw err;
						xbdAchievements.find({}).each(function(err, doc) {
							if (err) return;
							if (doc == null) {
								db.close();
								job.done();
								return;
							}
							userAchievements.find({ achievementId: doc._id, progressState: true }).count(function(err, achiCount) {
								if (err) throw err;
								console.log('acheivement count is ' + achiCount + ' for acheivement ' + doc.name);
								var achievementUnlockPercentage = Math.round((achiCount/userCount) * 100);
								xbdAchievements.updateOne({ _id: doc._id }, {$set: { userPercentage: achievementUnlockPercentage }});
							});
						});
					});
				});
			}
		});
	});
});