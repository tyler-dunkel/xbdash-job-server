var xboxApiCaller = require('./xbox-api-caller.js');
var xboxApiPrivate = require('./xbox-api-private.js');
var async = require('async');
var db = require('./db.js');

var xboxApiObject = xboxApiObject || {};

xboxApiObject.chkGamertag = function(gamertag, callback) {
	var url = 'xuid/' + gamertag;
	xboxApiCaller(url, function(err, data) {
		if (err) {
			callback({ reason: 'error retrieving gamertag', data: err }, null);
			return;
		}
		callback(null, data);
	});
}

xboxApiObject.updateXboxOneData = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('xbox one update data error');
		callback();
		return;
	}

	var users = db.collection('users');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'the db findOne failed', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			callback({ reason: 'the users gamertag isnt scanned' }, null);
			return;
		}

		var url = user.xuid + '/xboxonegames';

		xboxApiCaller(url, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}
			if (!data.titles || typeof data.titles.forEach !== 'function') {
				callback({ reason: 'api responsed with an error', data: data}, null);
				return;
			}

			var processGame = function(game, asyncCallback) {
				if (game.maxGamerscore ===  0) {
					console.log('no gamerscore');
					asyncCallback && asyncCallback();
					return;
				}

				var gameId = game.titleId.toString();

				console.log('xbox one processing game');
				
				async.parallel([
					function(callback) {
						//callback();
						console.log('calling acheivement function for: ' + game.name);
						xboxApiPrivate._updateXboxOneAchievementsData(userId, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								console.log('error in x1 achi data');
								return;
							}
							callback();
						});
					},
					function(callback) {
						//callback();
						xboxApiPrivate._updateXboxOneGameData(userId, game, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								console.log('error in update x1 game data');
								return;
							}
							callback();
						});
					},
					function(callback) {
						//callback();
						xboxApiPrivate._updateXboxOneGameDetails(userId, game, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								console.log('error in xbox one game details');
								return;
							}
							console.log('xbox one game details updated');
							callback();
						});
					}
				], function(err, result) {
					console.log('xbox 1 async done');
					asyncCallback && asyncCallback();
				});
			}

			var q = async.queue(processGame, 2);

			data.titles.forEach(function(game) {
				q.push(game, function(err) {
					console.log('adding ' + game.name + ' to the queue');
				});
			});

			q.drain = function(err) {
				console.log('all queue items done');
				callback && callback();
			}
			// async.each(data.titles, processGame, function(err) {
			// 	console.log('async done, should only run once');
			// 	callback && callback('this is bullshit', null);
			// });
		});
	});
}

xboxApiObject.updateXbox360Data = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('user 360 data problem');
		callback && callback();
		return;
	}

	console.log('user 360 data running');

	db.collection('users').findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'the db findOne failed', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			console.log('user gmamertag not scanned');
			callback({ reason: 'the users gamertag isnt scanned'}, null);
			return;
		}

		console.log('user.xuid');

		var url = user.xuid + '/xbox360games';

		xboxApiCaller(url, function(err, data) {
			if (err) {
				console.log('xbox api error');
				callback(err, null);
				return;
			}
			if (!data.titles || typeof data.titles.forEach !== 'function') {
				console.log('data doesnt have what we need in x360');
				callback({ reason: 'api responsed with an error', data: data}, null);
				return;
			}

			var processGame = function(game, asyncCallback) {
				if (game.totalGamerscore ===  0) {
					console.log('this game has 0 gamerscore ' + game.name);
					asyncCallback && asyncCallback();
					return;
				}

				var gameId = game.titleId.toString();

				async.parallel([
					function(callback) {
						//callback();
						xboxApiPrivate._updateXbox360AchievementsData(userId, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								console.log('error in x1 achi data');
								return;
							}
							callback();
						});
					},
					function(callback) {
						//callback();
						xboxApiPrivate._updateXbox360GameData(userId, game, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								return;
								console.log('error in update x360 game data');
							}
							callback();
						});
					},
					function(callback) {
						//callback();
						xboxApiPrivate._updateXbox360GameDetails(userId, game, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								return;
								console.log('error in xbox 360 game details');
							}
							callback();
						});
					}
				], function(err, result) {
					asyncCallback && asyncCallback();
				});
			}

			var q = async.queue(processGame, 2);

			data.titles.forEach(function(game) {
				q.push(game, function(err) {
					console.log('adding ' + game.name + ' to the queue');
				});
			});

			q.drain = function(err) {
				console.log('all 360 queue items done');
				callback && callback();
			}
		});
	});
}

xboxApiObject.updateGamercard = function(userId, callback) {
	console.log('update gamercard: ' + userId);
	if (typeof userId !== 'string') {
		console.log('error in update gamercar');
		callback('username not a string', null);
		return;
	}
	console.log('running gamertag update');

	var users = db.collection('users');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			console.log('error finding user');
			callback({ reason: 'db find error', data: err }, null);
			return;
		}
		console.log(user);
		if (!user || !user.xuid) {
			console.log(user);
			console.log('user is null: ' + user);
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}

		var url = user.xuid + '/gamercard';

		xboxApiCaller(url, function(err, result) {
			if (err) {
				callback(err, null);
				return;
			}
			if (!result || !result.gamertag) {
				callback({ reason: 'gamercard or gamertag does not exist', data: result }, null);
				return;
			}

			users.update({ _id: userId }, { $set: { gamercard: result } }, function(err, res) {
				if (err) {
					callback({ reason: 'error setting user gamercard', data: err }, null);
					return;
				}
				callback && callback();
			});
			console.log('updated user gamercard');
		});
	});
}

xboxApiObject.updateUserStats = function(userId, callback) {
	if (typeof userId !== 'string') return;

	var users = db.collection('users');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'error finding user', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned || !user.gamertagScanned.status || user.gamertagScanned.status === 'building') return;

		users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'updating' } }, function(err, res) {
			if (err) {
				callback({ reason: 'error setting gamertag status to "updating" user stats', data: err }, null);
				return;
			}
		});

		xboxApiObject.updateXboxOneData(userId, function(err, result) {
			if (err) {
				callback({ reason: 'error with xbox one data update', data: err }, null);
				return;
			}
			console.log('updated one users xbox one data');
		});
		xboxApiObject.updateXbox360Data(userId, function(err, result) {
			if (err) {
				callback({ reason: 'error with xbox 360 data update', data: err }, null);
				return;
			}
			console.log('updated one users xbox 360 data');
		});

		users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
			if (err) {
				callback({ reason: 'error setting gamertag status to true / setting last update', data: err }, null);
				return;
			}
		});
	});
	callback();
}

xboxApiObject.dirtyUpdateUserStats = function(userId, callback) {
	if (typeof userId !== 'string') {
		callback({ reason: 'type error userId not a string'}, null);
		return;
	}
	console.log('dirty function started');

	var users = db.collection('users');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'error with the db find', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned || !user.gamertagScanned.status || user.gamertagScanned.status === 'building') {
			callback({ reason: 'the users gamertag is not scanned or is building', data: user }, null);
			return;
		} 

		var url = user.xuid + '/gamercard';

		xboxApiCaller(url, function(err, result) {
			if (err) {
				callback(err, null);
				return;
			}
			console.log('api has been hit in dirty');
			if (result && result.gamerscore) {
				console.log('dirty function has gotten a gamerscore from the api');
				if (user.gamercard.gamerscore < result.gamerscore) {
					console.log('the gamerscore on record is lower than on the api');
					async.series([
						function(cb) {
							users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'updating', gamercard: result } }, function(err, res) {
								if (err) {
									console.log(err);
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiPrivate._dirtyCheckXboxOneGames(user, function(err, result) {
								if (err) {
									console.log(err);
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiPrivate._dirtyCheckXbox360Games(user, function(err, result) {
								if (err) {
									console.log(err);
								}
								cb && cb();
							});
						}
					], function(err) {
						users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
							if (err) {
								console.log(err);
							}
							callback && callback();
						});
					});
				} else {
					callback();
					return;
				}
			} else {
				callback({ reason: 'no result gamerscore from the api' }, null);
			}
		});
	});
}

module.exports = xboxApiObject;