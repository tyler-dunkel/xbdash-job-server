var xboxApiCaller = require('./xbox-api-caller.js');
var xboxApiPrivate = require('./xbox-api-private.js');
var async = require('async');
var randomstring = require("randomstring");
var db = require('./db.js');
var updateBadges = require('./badge-api/badges.js');
var slugifyGamertag = require('./gamertag-slugify.js');
var _ = require('underscore');

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

	console.log('user x1 data running');

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

		console.log(user.xuid + ' for x1');

		var url = user.xuid + '/xboxonegames';

		xboxApiCaller(url, function(err, data) {
			if (err) {
				console.log('xbox api error');
				callback(err, null);
				return;
			}
			if (!data.pagingInfo || data.pagingInfo.totalRecords === 0) {
				console.log('no x1 games available');
				callback();
				return;
			}
			if (!data.titles || typeof data.titles.forEach !== 'function') {
				callback({ reason: 'api responsed with an error', data: data}, null);
				return;
			}

			var processGame = function(game, asyncCallback) {
				if (game.maxGamerscore ===  0) {
					console.log('this x1 game has 0 gamerscore ' + game.name);
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
				console.log('all x1 queue items done');
				callback && callback();
			}
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

	var users = db.collection('users');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'the db findOne failed', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			callback({ reason: 'the users gamertag isnt scanned'}, null);
			return;
		}

		console.log(user.xuid + ' for x360');

		var url = user.xuid + '/xbox360games';

		xboxApiCaller(url, function(err, data) {
			if (err) {
				console.log('xbox api error');
				callback(err, null);
				return;
			}
			if (!data.pagingInfo || data.pagingInfo.totalRecords === 0) {
				console.log('no 360 games available');
				callback();
				return;
			}
			if (!data.titles || typeof data.titles.forEach !== 'function') {
				console.log('data doesnt have what we need in x360');
				callback({ reason: 'api responsed with an error', data: data }, null);
				return;
			}

			var processGame = function(game, asyncCallback) {
				if (game.totalGamerscore ===  0) {
					console.log('this x360 game has 0 gamerscore ' + game.name);
					asyncCallback && asyncCallback();
					return;
				}

				var gameId = game.titleId.toString();

				console.log('x360 processing game');

				async.parallel([
					function(callback) {
						//callback();
						xboxApiPrivate._updateXbox360AchievementsData(userId, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								console.log('error in x360 achi data');
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
					console.log('x360 async done');
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
				console.log('all x360 queue items done');
				callback && callback();
			}
		});
	});
}

xboxApiObject.updateScreenShots = function(userId, callback) {
	if (typeof userId !== 'string') {
		callback('username not a sting', null);
		return;
	}
	var users = db.collection('users');

	users.findOne({_id: userId}, function(err, user) {
		if (err) {
			console.log(err);
			callback('error in db find', null);
			return;
		}
		if (!user || !user.xuid) {
			console.log('user is null: ' + user);
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}

		var url = user.xuid + '/screenshots';

		xboxApiCaller(url, function(err, result) {
			console.log(result);
			if (!result || !result[0] || !result[0].state) {
				console.log(result);
				callback('no result from xbox api', null);
				return;
			}
			var screenShots = db.collection('screenshots');
			var processPicture = function(screenShot, asyncCallback) {
				var setObject = _.extend({userId: userId}, screenShot);
				var _id = randomstring.generate(17);
				screenShots.update({userId: userId, screenShotId: screenShot.screenshotid}, {$set: setObject, $setOnInsert: {_id: _id}}, {upsert: true}, function() {
					asyncCallback();
				});
			};
			console.log(result);
			async.eachSeries(result, processPicture, function(err) {
				console.log('calling async series end callback');
				callback();
			});
		});		
	});
}

xboxApiObject.updateVideoClips = function(userId, callback) {
	if (typeof userId !== 'string') {
		callback('username not a sting', null);
		return;
	}

	var users = db.collection('users');

	users.findOne({_id: userId}, function(err, user) {
		if (err) {
			console.log(err);
			callback('error in db find', null);
			return;
		}
		if (!user || !user.xuid) {
			console.log('user is null: ' + user);
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}

		var url = user.xuid + '/game-clips';

		xboxApiCaller(url, function(err, result) {
			if (!result || !result[0] || !result[0].gameClipDetails) {
				console.log('got here');
				callback('no result from xbox api', null);
				return;
			}
			var gameClips = db.collection('gameclips');
			var processClip = function(gameClip, asyncCallback) {
				var _id = randomstring.generate(17);
				var setObject = _.extend({userId: userId}, gameClip);
				gameClips.update({userId: userId, gameClipId: gameClip.gameClipId}, {$set: setObject, $setOnInsert: {_id: _id}}, {upsert: true}, function() {
					asyncCallback();
				});
			};
			console.log(result);
			async.eachSeries(result, processClip, function(err) {
				console.log('calling async series end callback');
				callback();
			});
		});		
	});
}

xboxApiObject.updateRecentActivity = function(userId, callback) {
	if (typeof userId !== 'string') {
		callback('username not a sting', null);
		return;
	}

	var users = db.collection('users');

	users.findOne({_id: userId}, function(err, user) {
		if (err) {
			console.log(err);
			callback('error in db find', null);
			return;
		}
		if (!user || !user.xuid) {
			console.log('user is null: ' + user);
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}

		var url = user.xuid + '/activity/recent';
		xboxApiCaller(url, function(err, result) {
			console.log(result);
			if (!result || !result[0] || !result[0].startTime) {
				console.log('got here');
				callback('no result from xbox api', null);
				return;
			}
			var recentActivity = db.collection('recentactivity');
			var _id = randomstring.generate(17);
			recentActivity.update({userId: userId}, {$set: {userId: userId, activityList: result}, $setOnInsert: { _id: _id }}, {upsert: true}, function(err, result) {
				callback();
			});
		});
	});
}

xboxApiObject.updateXboxPresence = function(userId, callback) {
	if (typeof userId !== 'string') {
		callback('username not a sting', null);
		return;
	}

	var users = db.collection('users');

	users.findOne({_id: userId}, function(err, user) {
		if (err) {
			console.log(err);
			callback('error in db find', null);
			return;
		}
		if (!user || !user.xuid) {
			console.log('user is null: ' + user);
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}
		var url = user.xuid + '/presence';

		xboxApiCaller(url, function(err, result) {
			console.log(result);
			if (!result || !result.state) {
				console.log(result);
				console.log(err);
				callback('no result from xbox api', null);
				return;
			}
			delete result['xuid'];
			users.update({ _id: userId }, { $set: { presence: result } }, function(err, res) {
				if (err) {
					callback({ reason: 'error setting user gamercard', data: err }, null);
					return;
				}
				callback && callback();
			});
		});
	});
}

xboxApiObject.updateXboxProfile = function(userId, callback) {
	if (typeof userId !== 'string') {
		callback('username not a sting', null);
		return;
	}

	var users = db.collection('users');

	users.findOne({_id: userId}, function(err, user) {
		if (err) {
			console.log(err);
			callback('error in db find', null);
			return;
		}
		if (!user || !user.xuid) {
			console.log('user is null: ' + user);
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}

		var url = user.xuid + '/profile';

		xboxApiCaller(url, function(err, result) {
			if (!result || !result.Gamerscore) {
				callback('error with xbox api', null);
				return;
			}
			var setObject = { 
				xboxProfile: {
					gameDisplayPicRaw: result.GameDisplayPicRaw,
					appDislayPicRaw: result.AppDisplayPicRaw,
					accountTier: result.AccountTier,
					xboxOneRep: result.XboxOneRep,
					isSponsoredUser: result.isSponsoredUser
				}
			};
			console.log(setObject);
			users.update({ _id: userId }, { $set: setObject }, function(err, res) {
				if (err) {
					callback({ reason: 'error setting user gamercard', data: err }, null);
					return;
				}
				callback && callback();
			});
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
				slugifyGamertag(userId, result, function(err) {
					if (err) {
						console.log(err);
					}
					callback && callback();
				});
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
							xboxApiObject.updateGamercard(userId, function(err, res) {
								if (err) {
									console.log('error with update gamercard');
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateXboxProfile(userId, function(err, res) {
								if (err) {
									console.log('error with update gamercard');
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateXboxPresence(userId, function(err, res) {
								if (err) {
									console.log('error with update gamercard');
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateRecentActivity(userId, function(err, res) {
								if (err) {
									console.log('error with update gamercard');
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateVideoClips(userId, function(err, res) {
								if (err) {
									console.log('error with update gamercard');
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateScreenShots(userId, function(err, res) {
								if (err) {
									console.log('error with update gamercard');
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiPrivate._dirtyCheckXboxOneGames(user, function(err, result) {
								if (err) {
									console.log(err);
								}
								console.log('dirty x1 game ended');
								cb && cb();
							});
						},
						function(cb) {
							xboxApiPrivate._dirtyCheckXbox360Games(user, function(err, result) {
								if (err) {
									console.log(err);
								}
								console.log('dirty x360 game ended');
								cb && cb();
							});
						},
						function(cb) {
							updateBadges(userId, function(err, res) {
								if (err) {
									console.log('err updating badges');
								}
								cb();
							});
						}
					], function(err) {
						users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
							if (err) {
								console.log(err);
							}
							console.log('dirty user update stats done');
							callback && callback();
						});
					});
				} else {
					users.update({ _id: userId }, { $set: {'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
							if (err) {
								console.log(err);
							}
							console.log('no dirty update needed');
							callback && callback();
						});
					return;
				}
			} else {
				callback({ reason: 'no result gamerscore from the api' }, null);
			}
		});
	});
}

module.exports = xboxApiObject;