var Client = require('mongodb').MongoClient;
var format = require('util').format;
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiCaller = require('./xbox-api-caller.js');
// var xboxApiPrivate = require('./xbox-api-private.js');

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

			var url = user.xuid + '/xboxonegames';

			xboxApiCaller(url, function(err, data) {
				if (err) throw err;

				data.titles.forEach(function(game) {
					if (game.maxGamerscore ===  0) return;

					var gameId = game.titleId.toString();

					xboxApiPrivate._updateXboxOneAchievementsData(userId, gameId, function(err, res) {
						if (err) throw err;
						xboxApiPrivate._updateXboxOneGameData(userId, game, gameId, function(err, res) {
							if (err) throw err;
							xboxApiPrivate._updateXboxOneGameDetails(userId, game, gameId, function(err, res) {
								if (err) throw err;
								db.close();
								callback(null, res);
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

			var url = user.xuid + '/xbox360games';

			xboxApiCaller(url, function(err, data) {
				if (err) throw err;

				data.titles.forEach(function(game) {
					if (game.maxGamerscore ===  0) return;

					var gameId = game.titleId.toString();

					xboxApiPrivate._updateXbox360AchievementsData(userId, gameId, function(err, res) {
						if (err) throw err;
						xboxApiPrivate._updateXbox360GameData(userId, game, gameId, function(err, res) {
							if (err) throw err;
							xboxApiPrivate._updateXbox360GameDetails(userId, game, gameId, function(err, res) {
								if (err) throw err;
								db.close();
								callback(null, res);
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

			var url = user.xuid + '/gamercard';

			xboxApiCaller(url, function(err, data) {
				if (err) throw err;

				users.updateOne({ _id: userId }, { $set: { gamercard: data.data } });

				db.close();
				callback(null, data);
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
			if (!user || !user.gamertagScanned || !user.gamertagScanned.status || user.gamertagScanned.status === 'building') return;

			users.updateOne({ _id: userId }, { $set: { 'gamertagScanned.status': 'updating' } });

			this.updateXboxOneGames(userId, function(err, res) {
				this.updateXbox360Data(userId, function(err, res) {
					if (err) throw err;

					users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } });

					db.close();
					callback(null, res);
				});
			});
		});
	});
}

// below this line has not been converted to async yet

xboxApiObject.dirtyUpdateUserStats = function(userId) {
	var user = Meteor.users.findOne(userId);

	if (!user || !user.gamertagScanned || !user.gamertagScanned.status === 'true') return;

	var url = user.xuid + '/gamercard';

	try {
		var result = syncApiCaller(url);
	} catch(e) {
		var error = 'there was a problem calling the xbox api';
	}

	if (error) {
		return;
	}

	if (result.data && result.data.gamerscore) {
		if (user.gamercard.gamerscore < result.data.gamerscore) {
			console.log('the gamerscore on record is lower than on the api');
			Meteor.users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'updating' } });
			Meteor.users.update({ _id: user._id }, { $set: { gamercard: result.data }});
			xboxApiPrivate._dirtyCheckXboxOneGames(user);
			xboxApiPrivate._dirtyCheckXbox360Games(user);
			Meteor.users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } });
			return;
		}
	}
}

module.exports = xboxApiObject;