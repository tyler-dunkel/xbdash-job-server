var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiCaller = require('./xbox-api-caller.js');
var xboxApiPrivate = require('./xbox-api-private.js');

var db = mongoJS(meteorUrl);

var xboxApiObject = xboxApiObject || {};

xboxApiObject.chkGamertag = function(gamertag, callback) {
	var url = 'xuid/' + gamertag;
	xboxApiCaller(url, function(err, data) {
		if (err) throw err;
		callback(null, data);
	});
}

// xbox one DONE

// xboxApiObject.updateXboxOneData = function(userId, callback) {
// 	if (typeof userId !== 'string') return;

// 	db.collection('users').findOne({ _id: userId }, function(err, user) {
// 		if (err) {
// 			callback({reason: 'the db findOne failed', data: err}, null);
// 			return;
// 		}
// 		if (!user || !user.gamertagScanned) {
// 			callback({reason: 'the users gamertag isnt scanned'}, null);
// 			return;
// 		}

// 		var url = user.xuid + '/xboxonegames';

// 		xboxApiCaller(url, function(err, data) {
// 			if (err) {
// 				callback(err, null);
// 				return;
// 			}

// 			if (!data.titles || typeof data.titles.forEach !== 'function') {
// 				callback({reason: 'api responsed with an error', data: data}, null);
// 				return;
// 			}

// 			data.titles.forEach(function(game) {
// 				if (game.maxGamerscore ===  0) return;

// 				var gameId = game.titleId.toString();

// 				xboxApiPrivate._updateXboxOneAchievementsData(userId, gameId, function(err, result) {
// 					if (err) {
// 						callback(err, null);
// 					}
// 				});
// 				xboxApiPrivate._updateXboxOneGameData(userId, game, gameId, function(err, result) {
// 					if (err) {
// 						callback(err, null);
// 					}
// 				});
// 				xboxApiPrivate._updateXboxOneGameDetails(userId, game, gameId, function(err, result) {
// 					if (err) {
// 						callback(err, null);
// 					}
// 				});
// 			});
// 		});
// 	});

// 	callback();
// }

xboxApiObject.updateXbox360Data = function(userId, callback) {
	if (typeof userId !== 'string') return;

	db.collection('users').findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({reason: 'the db findOne failed', data: err}, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			callback({reason: 'the users gamertag isnt scanned'}, null);
			return;
		}

		var url = user.xuid + '/xbox360games';

		xboxApiCaller(url, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			if (!data.titles || typeof data.titles.forEach !== 'function') {
				callback({reason: 'api responsed with an error', data: data}, null);
				return;
			}

			data.titles.forEach(function(game) {
				if (game.maxGamerscore ===  0) return;

				var gameId = game.titleId.toString();
				
				// xboxApiPrivate._updateXbox360AchievementsData(userId, gameId, function(err, result) {
				// 	if (err) {
				// 		callback(err, null);
				// 	}
				// });
				// xboxApiPrivate._updateXbox360GameData(userId, game, gameId, function(err, result) {
				// 	if (err) {
				// 		callback(err, null);
				// 	}
				// });
				xboxApiPrivate._updateXbox360GameDetails(userId, game, gameId, function(err, result) {
					if (err) {
						callback(err, null);
					}
				});
			});
		});
	});

	callback();
}

// xboxApiObject.updateGamercard = function(userId, callback) {
// 	if (typeof userId !== 'string') return;

// 	var users = db.collection('users');

// 	db.collection('users').findOne({ _id: userId }, function(err, user) {
// 		if (err) {
// 			throw err;
// 		}
// 		if (!user || !user.gamertagScanned || !user.gamertagScanned.status === 'true') return;

// 		var url = user.xuid + '/gamercard';

// 		xboxApiCaller(url, function(err, result) {
// 			if (err) throw err;
// 			users.update({ _id: userId }, { $set: { gamercard: result.data } });
// 			console.log('updated user gamercard');
// 		});
// 	});

// 	callback();
// }

// xboxApiObject.updateUserStats = function(userId, callback) {
// 	if (typeof userId !== 'string') return;

// 	var users = db.collection('users');

// 	db.collection('users').findOne({ _id: userId }, function(err, user) {
// 		if (err) {
// 			throw err;
// 		}
// 		if (!user || !user.gamertagScanned || !user.gamertagScanned.status || user.gamertagScanned.status === 'building') return;

// 		users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'updating' } });

// 		xboxApiObject.updateXboxOneGames(userId, function(err, result) {
// 			if (err) throw err;
// 			console.log('updated one users xbox one data');
// 		});
// 		xboxApiObject.updateXbox360Data(userId, function(err, result) {
// 			if (err) throw err;
// 			console.log('updated one users xbox 360 data');
// 		});

// 		users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } });
// 	});

// 	callback();
// }

// xboxApiObject.dirtyUpdateUserStats = function(userId, callback) {
// 	if (typeof userId !== 'string') return;

// 	var users = db.collection('users');

// 	db.collection('users').findOne({ _id: userId }, function(err, user) {
// 		if (err) {
// 			throw err;
// 		}
// 		if (!user || !user.gamertagScanned || !user.gamertagScanned.status === 'true') return;

// 		var url = user.xuid + '/gamercard';

// 		xboxApiCaller(url, function(err, result) {
// 			if (err) throw err;

// 			if (result && result.gamerscore) {
// 				if (user.gamercard.gamerscore < result.gamerscore) {
// 					console.log('the gamerscore on record is lower than on the api');
// 					users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'updating' } });
// 					users.update({ _id: userId }, { $set: { gamercard: result }});
// 					xboxApiPrivate._dirtyCheckXboxOneGames(user, function(err, result) {
// 						if (err) throw err;
// 						console.log('dirty check for xbox one games');
// 					});
// 					xboxApiPrivate._dirtyCheckXbox360Games(user, function(err, result) {
// 						if (err) throw err;
// 						console.log('dirty check for xbox 360 games');
// 					});
// 					users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } });
// 				} else {
// 					callback(err, null);
// 				}
// 			} else {
// 				callback(err, null);
// 			}
// 		});
// 	});
	
// 	callback();
// }

module.exports = xboxApiObject;