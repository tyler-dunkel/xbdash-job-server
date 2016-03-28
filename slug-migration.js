var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var slugBuilder = require('./slug-builder.js');
var async = require('async');

var db = mongoJS(meteorUrl);

module.exports = function() {
	var xbdAchievements = db.collection('xbdachievements'),
		xbdGames = db.collection('xbdgames');

	async.series([
		function(callback) {
			aysnc.parallel([
				function(cb) {
					xbdAchievements.update({$exists: { friendlySlugs: 1 } }, 
						{$unset: {friendlySlugs: "", slug: ""} }, { multi: true },
						function(err) {
							if (err) {
								console.log(err);
							}
							cb && cb();
						});
				},
				function(cb) {
					xbdGames.update({$exists: { friendlySlugs: 1 } }, 
						{$unset: {friendlySlugs: "", slug: ""} }, { multi: true },
						function(err) {
							if (err) {
								console.log(err);
							}
							cb && cb();
						});
				}
			], function(err) {
				console.log('removing of slugs complete');
				callback && callback();
			});
		},
		function(callback) {
			async.parallel([
				function(cb) {
					xbdAchievements.find({ $exists: { slug: 0 } })
						.forEach(function(err, doc) {
							if (err || !doc) {
								console.log('done with all docs');
								cb && callback();
								return;
							}
							slugBuilder('xbdachievements', doc, function(err, slugObj) {
								xbdAchievements.update({_id: doc._id}, 
									{baseSlug: slugObj.baseSlug, slug: slugObj.slug}, function(err) {
										cb && callback();
									});
							});
						});
				},
				function(cb) {
					xbdGames.find({ $exists: { slug: 0 } })
						.forEach(function(err, doc) {
							if (err || !doc) {
								console.log('done with all docs');
								cb && callback();
								return;
							}
							slugBuilder('xbdgames', doc, function(err, slugObj) {
								xbdGames.update({_id: doc._id}, 
									{baseSlug: slugObj.baseSlug, slug: slugObj.slug}, function(err) {
										cb && callback();
									});
							});
						});
				}
			], function(err) {
				console.log('all docs have new slugs');
				callback && callback();
			});
		}
	], function(err) {
		console.log('migration complete');
	});
}