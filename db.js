var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var mongoJS = require('mongojs');

var db = mongoJS(meteorUrl);

db.on('error', function(err) {
	console.log('db error: ' + err);
});

db.on('connect', function() {
	console.log('db is connected');
});

module.exports = db;