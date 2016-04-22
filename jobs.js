var DDP = require('ddp');
var jobRunToCompleted = require('./settings-reset.js');
var Job = require('meteor-job');
var DDPlogin = require('ddp-login');
var later = require('later');
var workers = require('./workers.js');
var db = require('./db.js');

var ddp = new DDP({
	host: 'beta.xbdash.com',
	port: 3000,
	ssl: true,
	autoReconnect : true,
	autoReconnectTimer : 500,
	ddpVersion : '1',
	url: 'wss://beta.xbdash.com/websocket',
	use_ejson: true
});

Job.setDDP(ddp);

ddp.connect(function (err, wasReconnect) {
	if (err) throw err;
	if (wasReconnect) {
		console.log('connection reestablished');
		jobRunToCompleted(function(err, res) {
			if (err) {
				console.log('error sending welcome email');
				return;
			}
			console.log('all jobs and users set back to default');
		});
	}
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

		console.log('connected to xbdash prod');

		jobRunToCompleted(function(err, res) {
			if (err) {
				console.log('error sending welcome email');
				return;
			}
			console.log('all jobs and users set back to default');
		});

		var dirtyUserStatsJob = new Job('xbdjobscollection', 'dirtyUserStatsJob', {})
			.priority('normal')
			.repeat({
				schedule: later.parse.text('every 5 mins')
			})
			.save(function (err, result) {
				if (err) return;
				if (!err && result) {
					console.log('dirty user stats job saved with ID: ' + result);
				}
			});

		var clearDailyRanksJob = new Job('xbdjobscollection', 'clearDailyRanksJob', {})
			.priority('normal')
			.repeat({
				schedule: later.parse.text('at 12:00 am starting on the 22st day of April in 2016')
			})
			.save(function (err, result) {
				if (err) return;
				if (!err && result) {
					console.log('clear daily ranks job saved with ID: ' + result);
				}
			});

		var profileBuilderWorker = Job.processJobs('xbdjobscollection', 'buildUserProfileJob', workers.profileBuilder);
		var dirtyUpdateUserStatsWorker = Job.processJobs('xbdjobscollection', 'dirtyUserStatsJob', { workTimeout: 600000 }, workers.dirtyUpdateUserStats);
		var clearDailyRanksWorker = Job.processJobs('xbdjobscollection', 'clearDailyRanksJob', { workTimeout: 600000 }, workers.clearDailyRanks);
	});
});



// var ddp = new DDP({
// 	host: 'localhost',
// 	port: 3000,
// 	use_ejson: true
// });

// Job.setDDP(ddp);

// ddp.connect(function (err, wasReconnect) {
// 	if (err) throw err;
// 	if (wasReconnect) {
// 		console.log('connection reestablished');
// 		jobRunToCompleted();
// 	}
// 	DDPlogin(ddp, {
// 		env: 'METEOR_TOKEN',
// 		method: 'email',
// 		account: 'kguirao87@gmail.com',
// 		pass: '121212',
// 		retry: 5
// 	}, function (err, token) {
// 		if (err) {
// 			db.close();
// 			throw err;
// 		}

// 		console.log('connected to xbdash');

// 		jobRunToCompleted();

// 		var clearDailyRanksJob = new Job('xbdjobscollection', 'clearDailyRanksJob', {})
// 			.priority('normal')
// 			.repeat({
// 				schedule: later.parse.text('at 12:00 am')
// 			})
// 			.save(function (err, result) {
// 				if (err) return;
// 				if (!err && result) {
// 					console.log('clear daily ranks job saved with ID: ' + result);
// 				}
// 			});

// 		var dirtyUserStatsJob = new Job('xbdjobscollection', 'dirtyUserStatsJob', {})
// 			.priority('normal')
// 			.repeat({
// 				schedule: later.parse.text('every 2 mins')
// 			})
// 			.save(function (err, result) {
// 				if (err) return;
// 				if (!err && result) {
// 					console.log('dirty user stats job saved with ID: ' + result);
// 				}
// 			});

// 		var buildUserProfileWorker = Job.processJobs('xbdjobscollection', 'buildUserProfileJob', workers.profileBuilder);
// 		var dirtyUpdateStatsWorker = Job.processJobs('xbdjobscollection', 'dirtyUserStatsJob', workers.dirtyUpdateUserStats);
// 		var clearDailyRanksJob = Job.processJobs('xbdjobscollection', 'clearDailyRanksJob', workers.profileBuilder);
// 	});
// });



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