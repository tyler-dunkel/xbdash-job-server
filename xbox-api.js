var xboxApiCaller = require('./xbox-api-caller.js');
var xboxApiPrivate = require('./xbox-api-private.js');
var async = require('async');
var randomstring = require("randomstring");
var moment = require('moment');
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
		console.log('there was an error in the updateXboxOneData method. userId was not a string');
		callback();
		return;
	}

	console.log('the updateXboxOneData function is running for: ' + userId + ' at: ' + moment().format());

	var users = db.collection('users');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'the db findOne failed', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned || !user.xuid) {
			console.log('the updateXboxOneData function was called with a nonScanned user: ' + userId);
			callback({ reason: 'the users gamertag isnt scanned' }, null);
			return;
		}

		console.log('updateXboxOneData. scanning xbox one games for(xuid): ' + user.xuid);

		var url = user.xuid + '/xboxonegames';

		xboxApiCaller(url, function(err, data) {
			if (err) {
				console.log('updateXboxOneData. there was an error with the xbox api at: ' + moment().format());
				console.log(err);
				console.log(data);
				callback(err, null);
				return;
			}
			if (!data.pagingInfo || data.pagingInfo.totalRecords === 0) {
				console.log('no x1 games available for: ' + userId);
				callback();
				return;
			}
			if (!data.titles || typeof data.titles.forEach !== 'function') {
				console.log('updateXboxOneData. the api response is not an array');
				console.log(data);
				callback({ reason: 'api responsed with an error', data: data}, null);
				return;
			}

			var processGame = function(game, asyncCallback) {
				if (game.maxGamerscore ===  0) {
					console.log('this x1 game has 0 gamerscore ' + game.name + ' not adding to db');
					asyncCallback && asyncCallback();
					return;
				}

				var gameId = game.titleId.toString();

				console.log('processing xbox one title: ' + game.name);
				
				async.parallel([
					function(callback) {
						//callback();
						xboxApiPrivate._updateXboxOneAchievementsData(userId, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								console.log('error in x1 game achi data for: ' + game.name);
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
								console.log('error in x1 game data for: ' + game.name);
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
								console.log('error in xbox one game details for: ' + game.name);
								return;
							}
							callback();
						});
					}
				], function(err, result) {
					console.log('done scanning xbox one game: ' + game.name + " at: " + moment().format());
					asyncCallback && asyncCallback();
				});
			}

			var q = async.queue(processGame, 1);

			data.titles.forEach(function(game) {
				q.push(game, function(err) {
					console.log('adding ' + game.name + ' to the queue');
				});
			});

			q.drain = function(err) {
				console.log('completed scanning xbox one games for: ' + userId + ' at: ' + moment().format());
				callback && callback();
			}
		});
	});
}

xboxApiObject.updateXbox360Data = function(userId, callback) {
	if (typeof userId !== 'string') {
		console.log('there was an error in the updateXbox360Data method. userId was not a string');
		callback && callback();
		return;
	}

	console.log('starting scan of xbox 360 data for: ' + userId + ' at: ' + moment().format());

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

		console.log('scanning for(xuid): ' + userId);

		var url = user.xuid + '/xbox360games';

		xboxApiCaller(url, function(err, data) {
			if (err) {
				console.log('updateXbox360Data. there was an error with the api at: ' + moment().format());
				console.log(err);
				console.log(data);
				callback(err, null);
				return;
			}
			if (!data.pagingInfo || data.pagingInfo.totalRecords === 0) {
				console.log('no 360 games available for: ' + userId);
				callback();
				return;
			}
			if (!data.titles || typeof data.titles.forEach !== 'function') {
				console.log('updateXbox360Data. the api response is not an array');
				console.log(data);
				callback({ reason: 'api responsed with an error', data: data }, null);
				return;
			}

			var processGame = function(game, asyncCallback) {
				if (game.totalGamerscore ===  0) {
					console.log('this x360 game has 0 gamerscore: ' + game.name + ' not adding to queue');
					asyncCallback && asyncCallback();
					return;
				}

				var gameId = game.titleId.toString();

				console.log('processing xbox 360 game: ' + game.name + ' at: ' + moment().format());

				async.parallel([
					function(callback) {
						//callback();
						xboxApiPrivate._updateXbox360AchievementsData(userId, gameId, function(err, result) {
							if (err) {
								callback(err, null);
								console.log('error in x360 achi data for: ' + game.name);
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
								console.log('error in update x360 game data for: ' + game.name);
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
								console.log('error in xbox 360 game details for: ' + game.name);
							}
							callback();
						});
					}
				], function(err, result) {
					console.log('done scanning xbox360 game: ' + game.name + ' at: ' + moment().format());
					asyncCallback && asyncCallback();
				});
			}

			var q = async.queue(processGame, 1);

			data.titles.forEach(function(game) {
				q.push(game, function(err) {
					console.log('adding ' + game.name + ' to the queue');
				});
			});

			q.drain = function(err) {
				console.log('finished scanning xbox 360 games for: ' + userId + ' at: ' + moment().format());
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
			console.log('updateScreenShots. error user is null or has no xuid');
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}

		var url = user.xuid + '/screenshots';

		console.log('beginning scan of screenshot for: ' + userId + ' at: ' + moment().format());

		xboxApiCaller(url, function(err, result) {
			if (!result || !result[0] || !result[0].state) {
				console.log('updateScreenShots. error from the api at: ' + moment().format());
				console.log(result);
				callback('no result from xbox api', null);
				return;
			}
			var screenShots = db.collection('screenshots');
			var processPicture = function(screenShot, asyncCallback) {
				var setObject = _.extend({userId: userId}, screenShot);
				var _id = randomstring.generate(17);
				screenShots.update({userId: userId, screenshotId: screenShot.screenshotId}, {$set: setObject, $setOnInsert: {_id: _id}}, {upsert: true}, function() {
					asyncCallback();
				});
			};
			async.eachSeries(result, processPicture, function(err) {
				console.log('finished updating screenshots for: ' + userId + ' at: ' + moment().format());
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
			console.log('updateVideoClips. error user is null or has no xuid');
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}

		var url = user.xuid + '/game-clips';

		console.log('beginning scan of video clips for: ' + userId + ' at: ' + moment().format());
		xboxApiCaller(url, function(err, result) {
			if (!result || !result[0] || !result[0].gameClipDetails) {
				console.log('updateVideoClips. error from the api at: ' + moment().format());
				console.log(result);
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
			async.eachSeries(result, processClip, function(err) {
				console.log('finished scanning gameclips for: ' + userId + ' at: ' + moment().format());
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
			console.log('updateRecentActivity. error user is null or has no xuid');
			callback({ reason: 'user does not have an xuid' }, null);
			return;
		}

		var url = user.xuid + '/activity/recent';
		xboxApiCaller(url, function(err, result) {
			if (!result || !result[0] || !result[0].startTime) {
				console.log('updateRecentActivity. error from the api at: ' + moment().format());
				console.log(result);
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
	console.log('starting update gamercard for: ' + userId + ' at: ' + moment().format());
	if (typeof userId !== 'string') {
		console.log('updateGamercard. userId passed is not a string');
		callback('username not a string', null);
		return;
	}

	var users = db.collection('users');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			console.log('updateGamercard. error finding user');
			callback({ reason: 'db find error', data: err }, null);
			return;
		}
		if (!user || !user.xuid) {
			console.log('updateGamercard. error user is null or has no xuid: ' + userId);
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
				console.log('updateGamercard. did no recieve a result or gamertag from the api at: ' + moment().format());
				console.log(result);
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
			console.log('update gamercard scan finished for: ' + userId + ' at: ' + moment().format());
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
	console.log('dirty update stat scan begun for: ' + userId + ' at: ' + moment().format());

	var users = db.collection('users');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'error with the db find', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned || !user.gamertagScanned.status || user.gamertagScanned.status === 'building') {
			console.log('dirtyUpdateUserStats. user: ' + userId + ' is in building or not scanned');
			callback({ reason: 'the users gamertag is not scanned or is building', data: user }, null);
			return;
		} 

		var url = user.xuid + '/gamercard';

		xboxApiCaller(url, function(err, result) {
			if (err) {
				callback(err, null);
				return;
			}
			if (result && result.gamerscore) {
				console.log('dirty function has gotten a gamerscore from the api for: ' + userId + ' at: ' + moment().format());
				if (user.gamercard.gamerscore < result.gamerscore) {
					async.series([
						function(cb) {
							xboxApiObject.updateGamercard(userId, function(err, res) {
								if (err) {
									console.log('error with update gamercard for: ' + userId + ' at: ' + moment().format());
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateXboxProfile(userId, function(err, res) {
								if (err) {
									console.log('error with update xbox profile for: ' + userId + ' at: ' + moment().format());
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateXboxPresence(userId, function(err, res) {
								if (err) {
									console.log('error with update xbox presence for: ' + userId + ' at: ' + moment().format());
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateRecentActivity(userId, function(err, res) {
								if (err) {
									console.log('error with update xbox recent activity for: ' + userId + ' at: ' + moment().format());
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateVideoClips(userId, function(err, res) {
								if (err) {
									console.log('error with update xbox video clips for: ' + userId + ' at: ' + moment().format());
									cb();
									return;
								}
								cb && cb();
							});
						},
						function(cb) {
							xboxApiObject.updateScreenShots(userId, function(err, res) {
								if (err) {
									console.log('error with update xbox screen shots for: ' + userId + ' at: ' + moment().format());
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
						},
						function(cb) {
							updateBadges(userId, function(err, res) {
								if (err) {
									console.log('error with update user badges for: ' + userId + ' at: ' + moment().format());
								}
								cb();
							});
						}
					], function(err) {
						users.update({ _id: userId }, { $set: { 'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
							if (err) {
								console.log(err);
							}
							console.log('dirty stat scan for: ' + userId + ' completed at: ' + moment().format());
							callback && callback();
						});
					});
				} else {
					console.log('dirty stat scan not needed for: ' + userId + ' scan ending at: ' + moment().format());
					users.update({ _id: userId }, { $set: {'gamertagScanned.status': 'true', 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
						if (err) {
							console.log(err);
						}
						callback();
					});
				}
			} else {
				callback('no result from api', null);
			}
		});
	});
}

module.exports = xboxApiObject;