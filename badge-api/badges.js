var async = require('async');
var badgeFunctions = require('./badge-functions.js');
var randomstring = require("randomstring");
var db = require('../db.js');


module.exports = function(userId, cb) {
	var userBadges = db.collection('xbdbadges');

	userBadges.findOne({userId: userId}, function(err, doc) {
		if (!doc) {
			var badges = {
				_id: randomstring.generate(17), 
				userId: userId,
				fiveGS: false,
				tenGS: false,
				twentyGS: false,
				fiftyGS: false,
				oneHundredGS: false,
				twoFiftyHundredGS: false,
				sevenFiftyHundredGS: false,
				nineHundredGS: false,
				twoMillionGS: false,
				solutionExpert: false,
				eagleScout: false,
				oneGame: false,
				tenGame: false,
				oneHundredGame: false,
				fiveHundredGame: false,
				oneThousandGame: false
			};
			userBadges.insert(badges);
			doc = badges;
		}
		async.series([
			function(callback) {
				badgeFunctions.gamerscoreFunction(doc, function(err) {
					if (err) {
						cosole.log(err);
					}
					callback();
				});
			},
			function(callback) {
				badgeFunctions.gameFunction(doc, function(err) {
					if (err) {
						cosole.log(err);
					}
					callback();
				});
			},
			function(callback) {
				badgeFunctions.solutionExpertFunction(doc, function(err) {
					if (err) {
						cosole.log(err);
					}
					callback();
				});
			},
			function(callback) {
				badgeFunctions.eagleScoutFunction(doc, function(err) {
					if (err) {
						cosole.log(err);
					}
					callback();
				});
			}
		], function(err) {
			cb && cb();
		});
	});
}