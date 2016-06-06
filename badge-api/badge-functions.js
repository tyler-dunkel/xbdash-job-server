var db = require('../db.js');
var users = db.collection('users');
var userGames = db.collection('usergames');
var xbdBadges = db.collection('xbdbadges');
var comments = db.collection('comments');

var gamerscoreFunction = function(userBadges, cb) {
	console.log(userBadges.userId);
	users.findOne({_id: userBadges.userId}, function(err, user) {
		console.log(user);
		if (!user || !user.gamercard || !user.gamercard.gamerscore) {
			cb && cb();
			return;
		}
		var setObject = {
			fiveGS: false,
			tenGS: false,
			twentyGS: false,
			fiftyGS: false,
			oneHundredGS: false,
			twoFiftyHundredGS: false,
			sevenFiftyHundredGS: false,
			nineHundredGS: false
		};
		var gamerscore = user.gamercard.gamerscore;
		if (gamerscore >= 5000) {
			setObject.fiveGS = true;
		}
		if (gamerscore >= 10000) {
			setObject.tenGS = true;
		}
		if (gamerscore >= 20000) {
			setObject.twentyGS = true;
		}
		if (gamerscore >= 50000) {
			setObject.fiftyGS = true;
		}
		if (gamerscore >= 100000) {
			setObject.oneHundredGS = true;
		}
		if (gamerscore >= 250000) {
			setObject.twoFiftyHundredGS = true;
		}
		if (gamerscore >= 750000) {
			setObject.sevenFiftyHundredGS = true;
		}
		if (gamerscore >= 999999) {
			setObject.nineHundredGS = true;
		}
		xbdBadges.update({userId: userBadges.userId}, {$set: setObject}, function(err) {
			if (err) {
				console.log(err);
			}
			cb && cb();
		});
	});
}

var gameFunction = function(userBadges, cb) {
	userGames.count({userId: userBadges.userId, completed: true}, function(err, count) {
		if (!count) {
			console.log('no count');
			cb && cb();
			return;
		}
		console.log('got here');
		var setObject = {
			oneGame: false,
			tenGame: false,
			oneHundredGame: false,
			fiveHundredGame: false,
			oneThousandGame: false
		}
		console.log('count is: ' + count);
		if (count >= 1) {
			setObject.oneGame = true;
		}
		if (count >= 10) {
			setObject.tenGame = true;
		}
		if (count >= 100) {
			setObject.oneHundredGame = true;
		} 
		if (count >= 1000) {
			setObject.oneThousandGame = true;
		}
		xbdBadges.update({userId: userBadges.userId}, {$set: setObject}, function(err) {
			if (err) {
				console.log(err);
			}
			cb && cb();
		});
	});
}

var solutionExpertFunction = function(userBadges, cb) {
	if (userBadges.solutionExpert === true) {
		cb && cb();
		return;
	}
	comments.count({userId: userBadges.userId}, function(err, count) {
		if (err) {
			console.log(err);
			cb && cb();
			return;
		}
		if (count > 100) {
			xbdBadges.update({userId: userBadges.userId}, {$set: {solutionExpert: true}}, function(err) {
				if (err) {
					console.log(err);
				}
				cb && cb();
			});
		} else {
			cb && cb();
		}
	});
}

var eagleScoutFunction = function(userBadges, cb) {
	for (var key in userBadges) {
		if (userBadges.hasOwnProperty(key)) {
			if (key === false) {
				cb && cb();
				return;
			} 
		}
	}
	xbdBadges.update({userId: userBadges.userid}, {$set: {eagleScout: true}}, function(err) {
		if (err) {
			console.log(err);
		}
		cb && cb();
		return;
	});
}

module.exports = {
	gamerscoreFunction: gamerscoreFunction,
	gameFunction: gameFunction,
	solutionExpertFunction: solutionExpertFunction,
	eagleScoutFunction: eagleScoutFunction
}