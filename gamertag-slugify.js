var tr = require('transliteration');
var slugify = require('transliteration').slugify;
var db = require('./db.js');

var slugifyXboxProfileGamertag = function(userId, xboxProfile, cb) {
	var users = db.collection('users');
	users.findOne({ _id: userId }, function(err, user) {
		if (user.gamertagSlug) {
			cb && cb();
			return;
		}
		if (!xboxProfile || !xboxProfile.Gamertag) {
			cb && cb();
			return;
		}
		var gamertagSlug = slugify(xboxProfile.Gamertag, { lowercase: true });
		users.update({ _id: userId }, { $set: { gamertagSlug: gamertagSlug } }, function(err) {
			if (err) {
				console.log(err);
			}
			cb && cb();
		});
	});
}

var slugifyGamercardGamertag = function(userId, gamercard, cb) {
	var users = db.collection('users');
	users.findOne({ _id: userId }, function(err, user) {
		if (user.gamertagSlug) {
			cb && cb();
			return;
		}
		if (!gamercard || !gamercard.gamertag) {
			cb && cb();
			return;
		}
		var gamertagSlug = slugify(gamercard.gamertag, { lowercase: true });
		users.update({ _id: userId }, { $set: { gamertagSlug: gamertagSlug } }, function(err) {
			if (err) {
				console.log(err);
			}
			cb && cb();
		});
	});
}

module.exports = {
	slugifyXboxProfileGamertag: slugifyXboxProfileGamertag,
	slugifyGamercardGamertag: slugifyGamercardGamertag
};