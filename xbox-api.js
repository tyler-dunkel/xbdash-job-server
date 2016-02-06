var Client = require('mongodb').MongoClient;
var format = require('util').format;
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiCaller = require('./xbox-api-caller.js');
var xboxApiPrivate = require('./xbox-api-private.js');

var xboxApiObject = xboxApiObject || {};

xboxApiObject.chkGamertag = function(gamertag, callback) {
	var url = 'xuid/' + gamertag;
	xboxApiCaller(url, function(err, data) {
		if (err) throw err;
		callback(null, data);
	});
}

xboxApiObject.updateXboxOneGames = function(userId, callback) {
	if (typeof userId !== 'string') return;

	Client.connect(meteorUrl, function (err, db) {
		if (err) throw err;

		db.collection('users').find({ _id: userId }).limit(1).next(function(err, user) {
			if (err) {
				db.close();
				throw err;
			}
			if (!user || !user.gamertagScanned) return;

			var url = user.xuid + '/xboxonegames';

			xboxApiCaller(url, function(err, data) {
				if (err) throw err;

				data.titles.forEach(function(game) {
					if (game.maxGamerscore ===  0) return;

					var gameId = game.titleId.toString();

					xboxApiPrivate._updateXboxOneAchievementsData(userId, gameId, function(err, result) {
						if (err) throw err;
						xboxApiPrivate._updateXboxOneGameData(userId, game, gameId, function(err, result) {
							if (err) throw err;
							xboxApiPrivate._updateXboxOneGameDetails(userId, game, gameId, function(err, result) {
								if (err) throw err;
								db.close();
								callback(null, result);
							});
						});
					});
				});
			});
		});
	});
}

xboxApiObject.updateXbox360Data = function(userId, callback) {
	if (typeof userId !== 'string') return;

	Client.connect(meteorUrl, function (err, db) {
		if (err) throw err;

		db.collection('users').find({ _id: userId }).limit(1).next(function(err, user) {
			if (err) {
				db.close();
				throw err;
			}
			if (!user || !user.gamertagScanned) return;

			var url = user.xuid + '/xbox360games';

			xboxApiCaller(url, function(err, data) {
				if (err) throw err;

				data.titles.forEach(function(game) {
					if (game.maxGamerscore ===  0) return;

					var gameId = game.titleId.toString();

					xboxApiPrivate._updateXbox360AchievementsData(userId, gameId, function(err, result) {
						if (err) throw err;
						xboxApiPrivate._updateXbox360GameData(userId, game, gameId, function(err, result) {
							if (err) throw err;
							xboxApiPrivate._updateXbox360GameDetails(userId, game, gameId, function(err, result) {
								if (err) throw err;
								db.close();
								callback(null, result);
							});
						});
					});
				});
			});
		});
	});
}

xboxApiObject.updateGamercard = function(userId, callback) {
	if (typeof userId !== 'string') return;

	Client.connect(meteorUrl, function (err, db) {
		if (err) throw err;

		var users = db.collection('users');

		users.find({ _id: userId }).limit(1).next(function(err, user) {
			if (err) {
				db.close();
				throw err;
			}
			if (!user || !user.gamertagScanned || !user.gamertagScanned.status === 'true') return;

			var url = user.xuid + '/gamercard';

			xboxApiCaller(url, function(err, result) {
				if (err) throw err;
				users.updateOne({ _id: userId }, { $set: { gamercard: result.data } });
				db.close();
				callback(null, result);
			});
		});
	});
}

xboxApiObject.updateUserStats = function(userId, callback) {
	if (typeof userId !== 'string') return;

	Client.connect(meteorUrl, function (err, db) {
		if (err) throw err;

		var users = db.collection('users');

		users.find({ _id: userId }).limit(1).next(function(err, user) {
			if (err) {
				db.close();
				throw err;
			}
			if (!user || !user.gamertagScanned || !user.gamertagScanned.status || user.gamertagScanned.status === 'building') return;

			users.updateOne({ _id: userId }, { $set: { 'gamertagScanned.status': 'updating' } });

			xboxApiObject.updateXboxOneGames(userId, function(err, result) {
				if (err) throw err;
				xboxApiObject.updateXbox360Data(userId, function(err, result) {
					if (err) throw err;
					users.updateOne({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } });
					db.close();
					callback(null, result);
				});
			});
		});
	});
}

xboxApiObject.dirtyUpdateUserStats = function(userId, callback) {
	if (typeof userId !== 'string') return;

	Client.connect(meteorUrl, function (err, db) {
		if (err) throw err;

		var users = db.collection('users');

		users.find({ _id: userId }).limit(1).next(function(err, user) {
			if (err) {
				db.close();
				throw err;
			}
			if (!user || !user.gamertagScanned || !user.gamertagScanned.status === 'true') return;

			var url = user.xuid + '/gamercard';

			xboxApiCaller(url, function(err, result) {
				if (err) throw err;

				console.log('in the caller');

				// users.updateOne({ _id: userId }, { $set: { 'gamercard.gamerscore': '0' } });
				// users.updateOne({ _id: userId }, { $set: { gamercard: result }});

				if (result && result.gamerscore) {
					if (user.gamercard.gamerscore < result.gamerscore) {
						console.log('the gamerscore on record is lower than on the api');
						users.updateOne({ _id: userId }, { $set: { 'gamertagScanned.status': 'updating' } });
						users.updateOne({ _id: userId }, { $set: { gamercard: result }});
						// xboxApiPrivate._dirtyCheckXboxOneGames(user, function(err, result) {
						// 	if (err) throw err;
						// 	xboxApiPrivate._dirtyCheckXbox360Games(user, function(err, result) {
						// 		if (err) throw err;
						// 		users.updateOne({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } });
						// 		db.close();
						// 		callback(null, result);
						// 	});
						// });
						callback(null, result);
					} else {
						callback(err, null);
					}
				} else {
					callback(err, null);
				}
			});
		});
	});
}

module.exports = xboxApiObject;