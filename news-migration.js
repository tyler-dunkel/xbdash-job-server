var mongoJS = require('mongojs');
// var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var meteorUrl = 'mongodb://xbadmin:tda88f552e87k15g@capital.4.mongolayer.com:10130,capital.5.mongolayer.com:10130/xbdash-production?replicaSet=set-569077792b73d794a800039f';

var db = mongoJS(meteorUrl);

var migrate = function() {
	var xbdNews = db.collection('xbdnews');

	xbdNews.update({}, { $set: { source: "polygon" } }, { multi: true }, function(err, res) {
	});
}

migrate();