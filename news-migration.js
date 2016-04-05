var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var async = require('async');

var db = mongoJS(meteorUrl);

module.exports = function() {
	var xbdNews = db.collection('xbdnews');

	xbdNews.update({}, { $set: { source: "polygon" } }, { multi: true }, function(err, res) {
		if (err) {
			console.log(err);
		}
		cb && cb();
	});
}