var DDP = require('ddp');
var Job = require('meteor-job');
var DDPlogin = require('ddp-login');
var randomstring = require("randomstring");
var xboxApiObject = require('./xbox-api.js');
var workers = require('./workers.js');
var async = require('async');
var db = require('./db.js');

var ddp = new DDP({
	host: 'beta.xbdash.com',
	port: 3000,
	use_ejson: true
});

Job.setDDP(ddp);

ddp.connect(function (err) {
	if (err) throw err;
	DDPlogin(ddp, {
		env: 'METEOR_TOKEN',
		method: 'email',
		account: 'tyler.dunkel@gmail.com',
		pass: 'Tjd11034',
		retry: 5
	}, function (err, token) {
		if (err) {
			db.close();
			throw err;
		}
		var buildUserProfileWorker = Job.processJobs('xbdjobscollection', 'buildUserProfileJob', workers.profileBuilder);
		var dirtyUpdateStatsWorker = Job.processJobs('xbdjobscollection', 'dirtyUserStatsJob', workers.dirtyUpdateUserStats);
	});
});

// var ddp = new DDP({
// 	host: "beta.xbdash.com",
// 	port: 443,
// 	ssl: true
// 	// url: "wss://beta.xbdash.com/websocket",
// 	// autoReconnect: true,
// 	// autoReconnectTimer: 500,
// 	// ddpVersion: '1',
// 	// useSockJs: true
// });
 
// ddp.connect(function(error, wasReconnect) {
// 	if (error) {
// 		console.log('DDP connection error!');
// 		return;
// 	}

// 	if (wasReconnect) {
// 		console.log('Reestablishment of a connection.');
// 	}

// 	console.log('connected!');

// 	setTimeout(function () {
// 		DDPlogin(ddp, {
// 			env: 'METEOR_TOKEN',
// 			method: 'email',
// 			account: "kguirao87@gmail.com",
// 			pass: 'kgXB!2016',
// 			retry: 5
// 		}, function (err, token) {
// 			if (err) {
// 				db.close();
// 				throw err;
// 			}
// 			console.log('Connected to XBdash Beta on Galaxy!');
// 			var buildUserProfileWorker = Job.processJobs('xbdjobscollection', 'buildUserProfileJob', workers.profileBuilder);
// 			var dirtyUpdateStatsWorker = Job.processJobs('xbdjobscollection', 'dirtyStatJob', workers.dirtyUpdateUserStats);
// 		});
// 	}, 3000);
// });