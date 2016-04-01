var DDP = require('ddp');
var Job = require('meteor-job');
var DDPlogin = require('ddp-login');
var randomstring = require("randomstring");
var xboxApiObject = require('./xbox-api.js');
var workers = require('./workers.js');
var async = require('async');
var db = require('./db.js');

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
	host: "beta.xbdash.com",
	port: 443,
	ssl: true
	// url: "wss://beta.xbdash.com/websocket",
	// autoReconnect: true,
	// autoReconnectTimer: 500,
	// ddpVersion: '1',
	// useSockJs: true
});

// Job.setDDP(ddp);
 
ddp.connect(function(error, wasReconnect) {
	if (error) {
		console.log('DDP connection error!');
		return;
	}

	if (wasReconnect) {
		console.log('Reestablishment of a connection.');
	}

	console.log('connected!');

	setTimeout(function () {
		DDPlogin(ddp, {
			env: 'METEOR_TOKEN',
			method: 'email',
			account: "kguirao87@gmail.com",
			pass: 'kgXB!2016',
			retry: 5
		}, function (err, token) {
			if (err) {
				db.close();
				throw err;
			}
			console.log('Connected to XBdash Beta on Galaxy!');
		});
	}, 3000);
});

// ddp.connect(function (err) {
// 	if (err) throw err;
// 	DDPlogin(ddp, {
// 		env: 'METEOR_TOKEN',
// 		method: 'account',
// 		account: "kguirao87@gmail.com",
// 		pass: '121212',
// 		retry: 5
// 	}, function (err, token) {
// 		if (err) {
// 			db.close();
// 			throw err;
// 		}
// 		// var buildUserProfileWorker = Job.processJobs('xbdjobscollection', 
// 		// 	'buildUserProfileJob', workers.profileBuilder);
// 	});
// });