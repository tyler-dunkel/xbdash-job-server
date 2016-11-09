var db = require('./db.js');

db.collection('xbdjobscollection.jobs').remove({ status: 'completed' }, function(err, result) {
	console.log('removed completed docs');
});

db.collection('xbdjobscollection.jobs').remove({ status: 'failed' }, function(err, result) {
	console.log('removed failed jobs');
});