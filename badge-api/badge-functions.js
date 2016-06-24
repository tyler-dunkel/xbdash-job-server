var db = require('../db.js');
var insertNotification = require('../insert-notification.js');
var users = db.collection('users');
var userGames = db.collection('usergames');
var xbdBadges = db.collection('xbdbadges');
var notifications = db.collection('notifications');
var comments = db.collection('comments');

var gamerscoreFunction = function(userBadges, cb) {
	var message = '';
	users.findOne({_id: userBadges.userId}, function(err, user) {
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
			if (userBadges.fiveGS === false) {
				message = 'You have unlocked the 5k gamerscore badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (gamerscore >= 10000) {
			setObject.tenGS = true;
			if (userBadges.tenGS === false) {
				message = 'You have unlocked the 10k gamerscore badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (gamerscore >= 20000) {
			setObject.twentyGS = true;
			if (userBadges.twentyGS === false) {
				message = 'You have unlocked the 20k gamerscore badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (gamerscore >= 50000) {
			setObject.fiftyGS = true;
			if (userBadges.fiftyGS === false) {
				message = 'You have unlocked the 50k gamerscore badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (gamerscore >= 100000) {
			setObject.oneHundredGS = true;
			if (userBadges.oneHundredGS === false) {
				message = 'You have unlocked the 100k gamerscore badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (gamerscore >= 250000) {
			setObject.twoFiftyHundredGS = true;
			if (userBadges.twoFiftyHundredGS === false) {
				message = 'You have unlocked the 250k gamerscore badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (gamerscore >= 750000) {
			setObject.sevenFiftyHundredGS = true;
			if (userBadges.sevenFiftyHundredGS === false) {
				message = 'You have unlocked the 750k gamerscore badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (gamerscore >= 999999) {
			setObject.nineHundredGS = true;
			if (userBadges.nineHundredGS === false) {
				message = 'You have unlocked the 1mil - 1 gamerscore badge!';
				insertNotification(userBadges.userId, message);
			}
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
			if (userBadges.oneGame === false) {
				message = 'You have unlocked the one completed game badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (count >= 10) {
			setObject.tenGame = true;
			if (userBadges.tenGame === false) {
				message = 'You have unlocked the ten completed games badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (count >= 100) {
			setObject.oneHundredGame = true;
			if (userBadges.oneHundredGame === false) {
				message = 'You have unlocked the one hundred completed games badge!';
				insertNotification(userBadges.userId, message);
			}
		}
		if (count >= 500) {
			setObject.fiveHundredGame = true;
			if (userBadges.fiveHundredGame === false) {
				message = 'You have unlocked the one hundred completed games badge!';
				insertNotification(userBadges.userId, message);
			}
		} 
		if (count >= 1000) {
			setObject.oneThousandGame = true;
			if (userBadges.oneThousandGame === false) {
				message = 'You have unlocked the one thousand completed games badge!';
				insertNotification(userBadges.userId, message);
			}
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
				var message = 'You have unlocked the solution expert badge!';
				insertNotification(userBadges.userId, message);
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
			if (userBadges[key] === false) {
				if (key !== 'eagleScout') {
					cb && cb();
					return;
				}
			} 
		}
	}
	xbdBadges.update({userId: userBadges.userid}, {$set: {eagleScout: true}}, function(err) {
		if (err) {
			console.log(err);
		}
		var message = 'You have unlocked the eagle scout badge!';
		insertNotification(userBadges.userId, message);
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