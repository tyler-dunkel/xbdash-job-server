var mongoJS = require('mongojs');
// var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var meteorUrl = 'mongodb://xbadmin:tda88f552e87k15g@capital.4.mongolayer.com:10130,capital.5.mongolayer.com:10130/xbdash-production?replicaSet=set-569077792b73d794a800039f';
var slugBuilder = require('./slug-builder.js');
var async = require('async');

var db = mongoJS(meteorUrl);

var migrate = function() {
	var xbdAchievements = db.collection('xbdachievements'),
		xbdGames = db.collection('xbdgames');

	async.series([
		function(callback) {
			async.parallel([
				function(cb) {
					xbdAchievements.update({ friendlySlugs: { $exists: 1 } }, 
						{ $unset: { friendlySlugs: "", slug: "" } }, { multi: true },
						function(err) {
							if (err) {
								console.log(err);
							}
							cb && cb();
						});
				},
				function(cb) {
					xbdGames.update({ friendlySlugs: { $exists: 1 } }, 
						{ $unset: { friendlySlugs: "", slug: "" } }, { multi: true },
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
					xbdAchievements.find({ slug: { $exists: 0 } })
						.forEach(function(err, doc) {
							if (!doc) {
								console.log('done with all docs');
								cb && cb();
								return;
							}
							if (err) {
								console.log(err);
								return;
							}
							slugBuilder('xbdachievements', doc, function(err, slugObj) {
								console.log('giving: ' + doc.name + ' ' + slugObj.slug);
								xbdAchievements.update({ _id: doc._id }, 
									{ $set: { baseSlug: slugObj.baseSlug, slug: slugObj.slug } }, function(err) {
										if (err) {
											console.log(err);
										}
									});
							});
						});
				},
				function(cb) {
					xbdGames.find({ slug: { $exists: 0 } })
						.forEach(function(err, doc) {
							if (err || !doc) {
								console.log('done with all docs');
								cb && cb();
								return;
							}
							slugBuilder('xbdgames', doc, function(err, slugObj) {

								console.log('giving: ' + doc.name + ' ' + slugObj.slug);
								xbdGames.update({ _id: doc._id },
									{ $set: { baseSlug: slugObj.baseSlug, slug: slugObj.slug} }, function(err) {
										if (err) return;
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

migrate();