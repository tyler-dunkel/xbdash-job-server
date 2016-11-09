var db = require('./db.js');

db.collection('xbdjobscollection.jobs').remove({ status: 'completed' }, function(err, result) {
	console.log('removed completed docs');
});

db.collection('xbdjobscollection.jobs').remove({ status: 'ready', type: "updateGameClips" }, function(err, result) {
	console.log('removed game clip docs');
});

db.collection('xbdjobscollection.jobs').remove({ status: 'failed' }, function(err, result) {
	console.log('removed failed jobs');
});