var db = require('./db.js');
var async = require('async');

var jobRunToCompleted = function(callback) {
	var jobsCollection = db.collection('xbdjobscollection.jobs');
	var users = db.collection('users');

	async.parallel([
		function(cb){
			jobsCollection.update({ 'status': 'running' }, { $set: { 'status': 'completed' } }, { multi: true },
				function(err) {
					if (err) {
						console.log(err);
						cb({reason: 'no jobs running'}, null);
						return;
					}
					console.log('updated running jobs to completed');
					cb && cb();
				});
		},
		function(cb){
			users.update({ 'gamertagScanned.status': 'updating' }, { $set: { 'gamertagScanned.status': 'true' } }, { multi: true },
				function(err) {
					if (err) {
						console.log(err);
						cb({reason: 'no users updating'}, null);
						return;
					}
					console.log('updated gamertag status to true');
					cb && cb();
				});
		},
		function(cb) {
			jobsCollection.remove({type: 'clearDailyRanksJob', status: 'waiting'}, function() {
				cb && cb();
			});
		}
	], function(err, res){
		callback && callback();
	});
}

module.exports = jobRunToCompleted;