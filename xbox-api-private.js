var xboxApiCaller = require('./xbox-api-caller.js');
var async = require('async');
var randomstring = require("randomstring");
var moment = require('moment');
var slugBuilder = require('./slug-builder.js');
var userPercentageFunc = require('./user-achievement-percentage.js');
var db = require('./db.js');

var xboxApiPrivate = xboxApiPrivate || {};

xboxApiPrivate._updateXboxOneAchievementsData = function(userId, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		console.log('_updateXboxOneAchievementsData. userId passed is not a string');
		callback({ reason: 'type err STRING LINE 11' }, null);
		return;
	}

	db.collection('users').findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'the db find was an error', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			console.log('_updateXboxOneAchievementsData. user passed is not scanned');
			callback({ reason: 'the users gamertag was not scanned' }, null);
			return;
		}

		var url = user.xuid + '/achievements/' + gameId;
		var xbdAchievements = db.collection('xbdachievements');
		var userAchievements = db.collection('userachievements');

		console.log('starting x1 achievement scan of: ' + gameId + ' for: ' + userId + ' at: ' + moment().format());

		xboxApiCaller(url, function(err, data) {
			if (err) {
				console.log('_updateXboxOneAchievementsData. error from api at: ' + moment().format());
				console.log(err);
				console.log(data);
				callback(err, null);
				return;
			}

			var processAchievement = function(achievement, asyncCallback) {
				if (!achievement.progression || achievement.progression.timeUnlocked === 0) {
					console.log('no unlocked time recorded for: ' + achievement.name);
					callback();
					return;
				}
				var progressState = (achievement.progressState !== 'NotStarted') ? true : false;
				var progression = achievement.progression.timeUnlocked;
				progression = new Date(progression);
				var achievementValue = achievement.rewards && achievement.rewards.length ? achievement.rewards[0].value : achievement.value;
				var _id = randomstring.generate(17);
				
				xbdAchievements.findOne({ gameId: gameId, name: achievement.name }, function(err, achievementCheck) {
					if (err) {
						asyncCallback && asyncCallback();
					}

					var insertUserAchievement = function(doc, cb) {
						var userAchievementId = randomstring.generate(17);

						var userAchievement = {
							achievementId: doc._id,
							userId: userId,
							progressState: progressState,
							progression: progression
						};
						userAchievements.update({ achievementId: doc._id, userId: userId }, { $set: userAchievement, $setOnInsert: { _id: userAchievementId } }, { upsert: true }, function(err, res) {
							if (err) {
								cb && cb();
								return;
							}
							userPercentageFunc(doc, function(err) {
								if (err) {
									cb && cb();
								}
								cb && cb();
							});
						});
					}

					if (!achievementCheck) {
						console.log('did not find acheivement: ' + acheivement.name + 'in the db. inserting');
						var singleAchievement = {
							_id: _id,
							gameId: gameId,
							name: achievement.name,
							mediaAssets: achievement.mediaAssets[0].url,
							isSecret: achievement.isSecret,
							description: achievement.description,
							lockedDescription: achievement.lockedDescription,
							value: achievementValue,
							userPercentage: 0
						};
						slugBuilder('xbdachievements', singleAchievement, function(err, slugObj) {
							singleAchievement.baseSlug = slugObj.baseSlug;
							singleAchievement.slug = slugObj.slug;
							achievementCheck = xbdAchievements.insert(singleAchievement, function(err, doc) {
								if (err) {
									asyncCallback && asyncCallback();
									return;
								}
								insertUserAchievement(doc, function() {
									asyncCallback && asyncCallback();
								});
								return;
							});
						});
					} else {
						insertUserAchievement(achievementCheck, function() {
							asyncCallback && asyncCallback();
						});
					}
				});
			}
			async.each(data, processAchievement, function(err) {
				console.log('ending x1 achievement scan of: ' + gameId + ' for: ' + userId + ' at: ' + moment().format());
				callback();
			});
		});
	});
}

xboxApiPrivate._updateXboxOneGameData = function(userId, game, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		console.log('_updateXboxOneGameData. userId passed is not a string');
		callback({ reason: 'type err STRING line 93' }, null);
		return;
	}

	var xbdGames = db.collection('xbdgames');
	var userGames = db.collection('usergames');
	var lastUnlock = game.lastUnlock;
	lastUnlock = new Date(lastUnlock);
	var gameInserted = false;

	console.log('starting scan of: ' + game.name + ' for: ' + userId + ' at: ' + moment().format());
	xbdGames.findOne({ _id: gameId }, function(err, gameCheck) {
		if (err) {
			console.log('callback on line 147 called (x1 game)');
			callback({ reason: 'the db find has an error', data: err }, null);
			return;
		}

		if (!gameCheck) {
			console.log('x1 game not found in the db: ' + game.name + ' inserting now');
			var singleGame = {
				_id: gameId,
				platform: game.platform,
				name: game.name,
				titleType: game.titleType,
				maxGamerscore: game.maxGamerscore
			};
			slugBuilder('xbdgames', singleGame, function(err, slugObj) {
				singleGame.baseSlug = slugObj.baseSlug;
				singleGame.slug = slugObj.slug;
				gameCheck = xbdGames.insert(singleGame);
				gameInserted = true;
			});
		}

		var completed = game.maxGamerscore > game.currentGamerscore ? false : true;
		var _id = randomstring.generate(17);
		var userGame = {
			lastUnlock: lastUnlock,
			gameId: gameId,
			userId: userId,
			currentGamerscore: game.currentGamerscore,
			earnedAchievements: game.earnedAchievements,
			completed: completed
		};

		userGames.update({ gameId: gameId, userId: userId }, { $set: userGame, $setOnInsert: { _id: _id } }, { upsert: true }, function(err, res) {
			if (err) {
				callback({ reason: 'error updating user xbox one games', data: err }, null);
				return;
			}
			console.log('ending scan of: ' + game.name + ' for: ' + userId + ' at: ' + moment().format());
			callback && callback();
		});
	});
}

xboxApiPrivate._updateXboxOneGameDetails = function(userId, game, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		console.log('_updateXboxOneGameDetails. userId passed is not a string');
		callback({ reason: 'type err STRING LINE 195' }, null);
		return;
	}

	var hexId = game.titleId.toString(16);
	console.log(hexId);
	var url = 'game-details-hex/' + hexId;
	var gameDetails = db.collection('gamedetails');
	    gameId = game.titleId.toString();

	console.log('starting game detail scan of: ' + game.name + ' at: ' + moment().format());
	xboxApiCaller(url, function(err, result) {
		if (err) {
			callback(err, null);
			return;
		}
		if (!result || !result.Items || !result.Items[0]) {
			console.log('xbox one game details api response is not an array at: ' + moment().format());
			callback({ reason: 'data does not have Items', data: err }, null);
			return;
		}

		gameDetails.findOne({ gameId: gameId }, function(err, gameCheck) {

			if (!gameCheck) {
				console.log('game details for: ' + game.name + ' not found in the db. inserting now');
				var _id = randomstring.generate(17);

				var gameDetail = {
					_id: _id,
					gameName: game.name,
					gameDescription: result.Items[0].Description,
					gameReducedDescription: result.Items[0].ReducedDescription,
					gameReducedName: result.Items[0].ReducedName,
					gameReleaseDate: result.Items[0].ReleaseDate,
					gameId: gameId,
					gameGenre: result.Items[0].Genres,
					gameArt: result.Items[0].Images,
					gamePublisherName: result.Items[0].PublisherName,
					gameParentalRating: result.Items[0].ParentalRating,
					gameAllTimePlayCount: result.Items[0].AllTimePlayCount,
					gameSevenDaysPlayCount: result.Items[0].SevenDaysPlayCount,
					gameThirtyDaysPlayCount: result.Items[0].ThirtyDaysPlayCount,
					gameAllTimeRatingCount: result.Items[0].AllTimeRatingCount,
					gameAllTimeAverageRating: result.Items[0].AllTimeAverageRating
				};

				gameDetails.insert(gameDetail, function(err) {
					if (err) {
						console.log('db insert error');
						callback && callback();
					}
					console.log('ending game detail scan of: ' + game.name + ' at: ' + moment().format());
					callback && callback();
				});
			} else {
				console.log('ending game detail scan of: ' + game.name + ' at: ' + moment().format());
				callback && callback();
			}
		});
	});
}

xboxApiPrivate._updateXbox360AchievementsData = function(userId, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		console.log('_updateXbox360AchievementsData. userId or gameId passed was not a string');
		callback({ reason: 'type err STRING LINE 256' }, null);
		return;
	}

	db.collection('users').findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'the db find has an error', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			console.log('_updateXbox360AchievementsData. user passed is not scanned');
			callback({ reason: 'the users gamertag was not scanned' }, null);
			return;
		}

		var url = user.xuid + '/achievements/' + gameId;
		var xbdAchievements = db.collection('xbdachievements');
		var userAchievements = db.collection('userachievements');

		console.log('starting scan of x360 achievement data for: ' + userId + ' at: ' + moment().format());
		xboxApiCaller(url, function(err, data) {
			if (err) {
				console.log('_updateXbox360AchievementsData. api returned an error at: ' + moment().format());
				console.log(err);
				console.log(data);
				callback(err, null);
				return;
			}
			if (typeof data.forEach !== 'function') {
				console.log('_updateXbox360AchievementsData. data returned from api is not an array');
				callback({ reason: 'data does not have a forEach, is not an array', data: data }, null);
				return;
			}

			var processAchievement = function(achievement, asyncCallback) {
				var progressState = (achievement.unlocked !== false) ? true : false;
				var progression = new Date(achievement.timeUnlocked);
				var achievementInserted = false;

				xbdAchievements.findOne({ gameId: gameId, name: achievement.name }, function(err, achievementCheck) {
					if (err) {
						asyncCallback && asyncCallback();
						return;
					}

					var insertUserAchievement = function(doc, cb) {
						var userAchievementId = randomstring.generate(17);
						var userAchievement = {
							achievementId: doc._id,
							userId: userId,
							progressState: progressState,
							progression: progression
						};
						userAchievements.update({ achievementId: doc._id, userId: userId }, { $set: userAchievement, $setOnInsert: { _id: userAchievementId } }, { upsert: true }, function(err, res) {
							if (err) {
								console.log('callback on line 311 called (x360 achi)');
								cb && cb();
								return;
							}
							userPercentageFunc(doc, function(err) {
								cb && cb();
							});
						});
					}

					if (!achievementCheck) {
						console.log('x360 acheivement: ' + achievement.name + ' not found in db. inserting now');
						var _id = randomstring.generate(17);
						var singleAchievement = {
							_id: _id,
							gameId: gameId,
							name: achievement.name,
							mediaAssets: achievement.imageUnlocked,
							isSecret: achievement.isSecret,
							description: achievement.description,
							lockedDescription: achievement.lockedDescription,
							value: achievement.gamerscore,
							userPercentage: 0
						};
						slugBuilder('xbdachievements', singleAchievement, function(err, slugObj) {
							singleAchievement.baseSlug = slugObj.baseSlug;
							singleAchievement.slug = slugObj.slug;
							achievementCheck = xbdAchievements.insert(singleAchievement, function(err, doc) {
								if (err) {
									asyncCallback && asyncCallback();
									return;
								}
								insertUserAchievement(doc, function() {
									asyncCallback && asyncCallback();
								});
								return;
							});
						});
					} else {
						insertUserAchievement(achievementCheck, function() {
							asyncCallback && asyncCallback();
						});
					}
				});
			}

			async.each(data, processAchievement, function(err) {
				if (err) {
				}
				console.log('ending scan of x360 achievement data for: ' + userId + ' at: ' + moment().format());
				callback && callback();
			});
		});
	});
}

xboxApiPrivate._updateXbox360GameData = function(userId, game, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		console.log('_updateXbox360GameData. the userId passed was not a string');
		callback({ reason: 'type err STRING LINE 274' }, null);
		return;
	}

	var xbdGames = db.collection('xbdgames');
	var userGames = db.collection('usergames');
	var gameInserted = false;

	console.log('starting x360 game scan of: ' + game.name + ' for: ' + userId + ' at: ' + moment().format());
	xbdGames.findOne({ _id: gameId }, function(err, gameCheck) {
		if (err) {
			callback({ reason: 'the db find has an error', data: err }, null);
			return;
		}
		if (!gameCheck) {
			console.log('x360 game ' + game.name + ' not found in db. inserting now');
			var singleGame = {
				_id: gameId,
				platform: 'Xenon',
				name: game.name,
				titleType: game.titleType,
				maxGamerscore: game.totalGamerscore
			};
			slugBuilder('xbdgames', singleGame, function(err, slugObj) {
				singleGame.baseSlug = slugObj.baseSlug;
				singleGame.slug = slugObj.slug;
				gameCheck = xbdGames.insert(singleGame);
				gameInserted = true;
			});
		}
		
		var lastPlayed = new Date(game.lastPlayed);
		var completed = game.totalGamerscore > game.currentGamerscore ? false : true;
		var _id = randomstring.generate(17);
		var userGame = {
			lastUnlock: lastPlayed,
			gameId: gameId,
			userId: userId,
			currentGamerscore: game.currentGamerscore,
			earnedAchievements: game.currentAchievements,
			completed: completed
		};

		userGames.update({ gameId: gameId, userId: userId }, { $set: userGame, $setOnInsert: { _id: _id } }, { upsert: true }, function(err, res) {
			if (err) {
				callback({ reason: 'error updating user xbox 360/other games', data: err }, null);
				return;
			}
			console.log('ending x360 game scan of: ' + game.name + ' for: ' + userId + ' at: ' + moment().format());
			callback && callback();
		});
	});
}

xboxApiPrivate._updateXbox360GameDetails = function(userId, game, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		callback({ reason: 'type err STRING LINE 319' }, null);
		return;
	}

	var gameDetails = db.collection('gamedetails');
	console.log('starting x360 game details scan of: ' + game.name + ' at: ' + moment().format());
	gameDetails.findOne({ gameId: gameId }, function(err, gameCheck) {
		if (err) {
			callback({ reason: 'the db find has an error', data: err }, null);
			return;
		}
		if (gameCheck) {
			console.log('ending x360 game details scan of: ' + game.name + ' at: ' + moment().format());
			callback();
			return;
		} else {
			var hexId = game.titleId.toString(16);
			console.log(hexId);
			var url = 'game-details-hex/' + hexId;

			xboxApiCaller(url, function(err, result) {
				if (err) {
					callback(err, null);
					return;
				}
				var gameDetail;
				var _id = randomstring.generate(17);
				if (result && result.Items) {
					var releaseDate = (typeof result.Items[0].ReleaseDate !== 'undefined') ? result.Items[0].ReleaseDate : result.Items[0].Updated;
					releaseDate = new Date(parseInt(releaseDate.substr(6)));
					releaseDate = releaseDate.toISOString();
					var allTimeAverageRating = (typeof result.Items[0].AllTimeAverageRating !== 'undefined') ? result.Items[0].AllTimeAverageRating : 0;
					gameDetail = {
						_id: _id,
						gameName: game.name,
						gameDescription: result.Items[0].Description,
						gameReducedDescription: result.Items[0].ReducedDescription,
						gameReducedName: result.Items[0].ReducedName,
						gameReleaseDate: releaseDate,
						gameId: gameId,
						gameGenre: result.Items[0].Genres,
						gameArt: result.Items[0].Images,
						gamePublisherName: result.Items[0].PublisherName,
						gameParentalRating: result.Items[0].ParentalRating, // undefined
						gameAllTimePlayCount: result.Items[0].AllTimePlayCount, // undefined
						gameSevenDaysPlayCount: result.Items[0].SevenDaysPlayCount, // undefined
						gameThirtyDaysPlayCount: result.Items[0].ThirtyDaysPlayCount, // undefined
						gameAllTimeRatingCount: result.Items[0].AllTimeRatingCount, // undefined
						gameAllTimeAverageRating: allTimeAverageRating
					};
				} else {
					gameDetail = {
						_id: _id,
						gameName: game.name,
						gameDescription: "This is the Windows version of the Xbox 360 game: " + game.name,
						gameReducedDescription: "This is the Windows version of the Xbox 360 game: " + game.name,
						gameReducedName: game.name,
						gameReleaseDate: "2005-11-22T00:00:00Z",
						gameId: gameId,
						gameGenre: [{ Name: "Miscellaneous" }],
						gameArt: [{ Url: "/img/game-default.png" }],
						gamePublisherName: "Games for Windows",
						gameParentalRating: "Everyone",
						gameAllTimePlayCount: 0,
						gameSevenDaysPlayCount: 0,
						gameThirtyDaysPlayCount: 0,
						gameAllTimeRatingCount: 0,
						gameAllTimeAverageRating: 0
					};
				}
				gameDetails.insert(gameDetail, function(err, res) {
					if (err) {
						callback({ reason: 'error updating xbox one game details', data: err }, null);
						return;
					}
					console.log('ending x360 game details scan of: ' + game.name + ' at: ' + moment().format());
					callback && callback();
				});

			});
		}
	});
};

xboxApiPrivate._dirtyCheckXboxOneGames = function(user, callback) {
	if (!user || !user.gamertagScanned) {
		callback({ reason: 'the users gamertag was not scanned' }, null);
		return;
	}

	var self = this;
	var url = user.xuid + '/xboxonegames';
	var userLastUpdate = user.gamertagScanned.lastUpdate;
	var userGames = db.collection('usergames');

	console.log('starting dirty x1 game function for: ' + user._id + ' at: ' + moment().format());
	xboxApiCaller(url, function(err, result) {
		if (err) {
			console.log('_dirtyCheckXboxOneGames. there was an error with the api at: ' + moment().format());
			console.log(err);
			console.log(result);
			callback(err, null);
			return;
		}
		if (!result.titles || typeof result.titles.forEach !== 'function') {
			console.log('_dirtyCheckXboxOneGames. the response from the api was not an array');
			console.log(result);
			callback({ reason: 'there are no games in the result' }, null);
			return;
		}
		if (!result.pagingInfo || result.pagingInfo.totalRecords === 0) {
			console.log('user: ' + user._id + ' has no x1 games in history');
			callback({ reason: 'no x1 games in user history' }, null);
			return;
		}

		var processGame = function(game, asyncCallback) {
			if (game.maxGamerscore ===  0) {
				console.log('no gamerscore for game: ' + game.name + ' removing from queue');
				asyncCallback && asyncCallback();
				return;
			}

			var gameId = game.titleId.toString();
			var gameLastUnlock = new Date(game.lastUnlock);

			console.log('starting dirty x1 scan for: ' + game.name + ' for: ' + user._id + ' at: ' + moment().format());
			
			if (gameLastUnlock < userLastUpdate) {
				console.log('dirty xbox one scan. no update needed for: ' + game.name + ' in the library of: ' + user._id);
				console.log('ending dirty x1 scan for: ' + game.name + ' for: ' + user._id + ' at: ' + moment().format());
				asyncCallback && asyncCallback();
				return;
			}

			async.parallel([
				function(callback) {
					//callback();
					self._updateXboxOneAchievementsData(user._id, gameId, function(err, result) {
						if (err) {
							console.log('error in x1 achi data');
							callback(err, null);
							return;
						}
						callback();
					});
				},
				function(callback) {
					//callback();
					self._updateXboxOneGameData(user._id, game, gameId, function(err, result) {
						if (err) {
							console.log('error in update x1 game data');
							callback(err, null);
							return;
						}
						callback();
					});
				},
				function(callback) {
					//callback();
					self._updateXboxOneGameDetails(user._id, game, gameId, function(err, result) {
						if (err) {
							console.log('error in xbox one game details');
							callback(err, null);
							return;
						}
						console.log('xbox one game details updated');
						callback();
					});
				}
			], function(err, result) {
				console.log('ending dirty x1 scan for: ' + game.name + ' for: ' + user._id + ' at: ' + moment().format());
				asyncCallback && asyncCallback();
			});
		}

		var q = async.queue(processGame, 1);

		q.drain = function(err) {
			console.log('ending dirty x1 game function for: ' + user._id + ' at: ' + moment().format());
			callback && callback();
		}

		result.titles.forEach(function (game) {

			q.push(game, function(err) {
			});
		});
	});
};

xboxApiPrivate._dirtyCheckXbox360Games = function (user, callback) {
	var self = this;
	var url = user.xuid + '/xbox360games';
	var userLastUpdate = user.gamertagScanned.lastUpdate;

	xboxApiCaller(url, function(err, result) {
		if (err) {
			console.log('error checking xbox games');
			callback(err, null);
			return;
		}
		if (!result.titles || typeof result.titles.forEach !== 'function') {
			callback({ reason: 'there are no titles in the result' }, null);
			return;
		}
		if (!result.pagingInfo || result.pagingInfo.totalRecords === 0) {
			callback({ reason: 'no x360 games in user history' }, null);
			return;
		}
		console.log('starting dirty x360 scan for: ' + user._id + ' at: ' + moment().format());
		var processGame = function(game, asyncCallback) {
			if (game.maxGamerscore ===  0) {
					console.log('no gamerscore for game: ' + game.name + ' removing from queue');
					asyncCallback && asyncCallback();
					return;
			}

			var gameId = game.titleId.toString();

			var gameLastPlayed = new Date(game.lastPlayed);
			
			if (gameLastPlayed < userLastUpdate) {
				console.log('dirty x360 scan. no update needed for: ' + game.name + ' in the library of: ' + user._id);
				console.log('ending dirty x360 scan for: ' + game.name + ' for: ' + user._id + ' at: ' + moment().format());
				asyncCallback && asyncCallback();
				return;
			}

			console.log('starting dirty x360 scan of: ' + game.name + ' for: ' + user._id + ' at: ' + moment().format());
			async.parallel([
				function(cb) {
					self._updateXbox360AchievementsData(user._id, gameId, function(err, result) {
						if (err) {
							console.log('error in x360 achievement data');
							cb(err, null);
							return;
						}
						cb && cb();
					});
				},
				function(cb) {
					//callback();
					self._updateXbox360GameData(user._id, game, gameId, function(err, result) {
						if (err) {
							console.log('error in x360 game data');
							cb(err, null);
							return;
						}
						cb && cb();
					});
				},
				function(cb) {
					//callback();
					self._updateXbox360GameDetails(user._id, game, gameId, function(err, result) {
						if (err) {
							console.log('error in x360 game details');
							cb(err, null);
							return;
						}
						cb && cb();
					});
				}
			], function(err, result) {
				console.log('ending dirty x360 scan of: ' + game.name + ' for: ' + user._id + ' at: ' + moment().format());
				asyncCallback && asyncCallback();
			});
		}

		var q = async.queue(processGame, 1);

		q.drain = function(err) {
			console.log('ending dirty x360 scan for: ' + user._id + ' at: ' + moment().format());
			callback && callback();
		}

		result.titles.forEach(function(game) {
			q.push(game, function(err) {
				console.log('adding ' + game.name + ' to the queue');
			});
		});
	});
};

module.exports = xboxApiPrivate;