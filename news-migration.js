var db = require('./db.js');

module.exports = function() {
	var xbdNews = db.collection('xbdnews');

	xbdNews.update({}, { $set: { source: "polygon" } }, { multi: true }, function(err, res) {
		if (err) {
			console.log(err);
		}
		cb && cb();
	});
}