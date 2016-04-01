var tr = require('transliteration');
var slugify = require('transliteration').slugify;
var db = require('./db.js');

var slugBuilder = function(collectionName, record, cb) {
	recordName = tr(record.name).replace(/\((r)\)|\((c)\)|\((tm)\)|®|©|™|'|ʼ/g, ''); // ® © ™ ' ʼ
	
	var baseSlug = slugify(recordName, { lowercase: true });
	var collection = db.collection(collectionName);
	
	collection.find({ baseSlug: baseSlug }, function(err, docs) {
		if (err) {
			cb && cb(err, null);
			return;
		}
		var baseSlugCount = docs.length || 0;
		if (baseSlugCount !== 0) {
			slug = baseSlug + '-' + baseSlugCount;
		} else {
			slug = baseSlug;
		}
		cb && cb(null, {baseSlug: baseSlug, slug: slug});
	});
}

module.exports = slugBuilder;