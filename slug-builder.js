var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var slug = require('slug');

var db = mongoJS(meteorUrl);

var slugBuilder = function(collectionName, record, cb) {
	slug.charmap['®'] = '';
	slug.charmap['registered'] = '';
	slug.charmap['©'] = '';
	slug.charmap['™'] = '';
	var nameSlug = slug(record.name, { lower: true });
	var collection = db.collection(collectionName);
	collection.find({ slug: nameSlug }, function(err, docs) {
		if (err) {
			cb && cb(err, null);
			return;
		}
		var slugNameCount = docs.length || 0;
		console.log(slugNameCount);
		if (slugNameCount !== 0) {
			nameSlug = nameSlug + '-' + slugNameCount;
		}
		cb && cb(null, nameSlug);
	});
}

module.exports = slugBuilder;