var tr = require('transliteration');
var slugify = require('transliteration').slugify;
var db = require('./db.js');

var slugifyGamercardGamertag = function(userId, gamercard, cb) {
	var users = db.collection('users');
	users.findOne({ _id: userId }, function(err, user) {
		if (user.gamertagSlug) {
			cb && cb();
			return;
		}
		console.log(gamercard.gamertag);
		var gamertagSlug = slugify(gamercard.gamertag, { lowercase: true });
		users.update({ _id: userId }, { $set: { gamertagSlug: gamertagSlug } }, function(err) {
			if (err) {
				console.log(err);
			}
			cb && cb();
		});
	});
}

var slugifyXboxProfileGamertag = function(userId, xboxProfile, cb) {
	var users = db.collection('users');
	users.findOne({ _id: userId }, function(err, user) {
		if (user.gamertagSlug) {
			cb && cb();
			return;
		}
		console.log(xboxProfile.gamertag);
		var gamertagSlug = slugify(xboxProfile.gamertag, { lowercase: true });
		users.update({ _id: userId }, { $set: { gamertagSlug: gamertagSlug } }, function(err) {
			if (err) {
				console.log(err);
			}
			cb && cb();
		});
	});
}

module.exports = {
	slugifyGamercardGamertag: slugifyGamercardGamertag,
	slugifyXboxProfileGamertag: slugifyXboxProfileGamertag
};