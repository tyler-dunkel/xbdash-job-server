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
	DDPlogin(ddp, {
		env: 'METEOR_TOKEN',
		method: 'account',
		account: 'tyler.dunkel@gmail.com',
		pass: '12341234',
		retry: 5
	}, function (err, token) {
		if (err) {
			db.close();
			throw err;
		}
		console.log('starting worker');
		var buildUserProfileWorker = Job.processJobs('xbdjobscollection', 
			'buildUserProfileJob', workers.profileBuilder);
	});
});