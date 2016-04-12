var meteorUrl = 'mongodb://xbadmin:tda88f552e87k15g@capital.4.mongolayer.com:10130,capital.5.mongolayer.com:10130/xbdash-production?replicaSet=set-569077792b73d794a800039f';
var mongoJS = require('mongojs');

var db = mongoJS(meteorUrl);

db.on('error', function(err) {
	console.log('db error: ' + err);
});

db.on('connect', function() {
	console.log('db is connected');
});

module.exports = db;