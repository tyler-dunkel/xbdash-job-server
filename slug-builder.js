var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var tr = require('transliteration');
var slugify = require('transliteration').slugify;

var db = mongoJS(meteorUrl);

var slugBuilder = function(collectionName, record, cb) {
	recordName = tr(record.name).replace(/\((r)\)|\((c)\)|\((tm)\)|®|©|™|'|ʼ/g, ''); // ® © ™ ' ʼ
	
	var nameSlug = slugify(recordName, { lowercase: true });
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