var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiCaller = require('./xbox-api-caller.js');

var db = mongoJS(meteorUrl);

var xboxApiPrivate = xboxApiPrivate || {};

xboxApiPrivate._updateXboxOneAchievementsData = function(userId, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		callback({reason: 'type err STRING LINE 11'}, null);
		return;
	}

	var users = db.collection('users');

	db.collection('users').findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'the db find was an error', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			callback({ reason: 'the users gamertag was not scanned' }, null);
			return;
		}

		var url = user.xuid + '/achievements/' + gameId;
		var xbdAchievements = db.collection('xbdachievements');
		var userAchievements = db.collection('userachievements');

		xboxApiCaller(url, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}

			data.forEach(function(achievement) {
				var progressState = (achievement.progressState !== 'NotStarted') ? true : false;
				var progression = achievement.progression.timeUnlocked;
				progression = new Date(progression);
				var achievementInserted = false;
				var achievementValue = achievement.rewards && achievement.rewards.length ? achievement.rewards[0].value : achievement.value;
				
				xbdAchievements.findOne({ gameId: gameId, name: achievement.name }, function(err, achievementCheck) {
					if (err) {
						callback({ reason: 'xbdAcheivemnts find failed', data: err }, null);
					}
					console.log('checked achievement');

					if (!achievementCheck) {
						var singleAchievement = {
							gameId: gameId,
							name: achievement.name,
							mediaAssets: achievement.mediaAssets[0].url,
							isSecret: achievement.isSecret,
							description: achievement.description,
							lockedDescription: achievement.lockedDescription,
							value: achievementValue,
							userPercentage: 0
						};
						achievementCheck = xbdAchievements.insert(singleAchievement);
						achievementInserted = true;
					} else {
						if (!achievementInserted) {
							achievementCheck = achievementCheck._id;
						}

						var userAchievement = {
							achievementId: achievementCheck,
							userId: userId,
							progressState: progressState,
							progression: progression
						};

						userAchievements.update({ achievementId: achievementCheck, userId: userId }, { $set: userAchievement }, { upsert: true }, function(err, res) {
							if (err) {
								callback({ reason: 'error updating user acheivements', data: err }, null);
								return;
							}
							console.log('user achievements updated');
						});
					}
				});
			});
		});
	});

	callback();
}

xboxApiPrivate._updateXboxOneGameData = function(userId, game, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		callback({ reason: 'type err STRING line 93'}, null);
		return;
	}

	var xbdGames = db.collection('xbdgames');
	var userGames = db.collection('usergames');

	var lastUnlock = game.lastUnlock;
	lastUnlock = new Date(lastUnlock);
	var gameInserted = false;

	xbdGames.findOne({ _id: gameId }, function(err, gameCheck) {
		if (err) {
			callback({ reason: 'the db find has an error', data: err }, null);
			return;
		}

		if (!gameCheck) {
			var singleGame = {
				_id: gameId,
				platform: game.platform,
				name: game.name,
				titleType: game.titleType,
				maxGamerscore: game.maxGamerscore
			};
			gameCheck = xbdGames.insert(singleGame);
			gameInserted = true;
		}

		var completed = game.maxGamerscore > game.currentGamerscore ? false : true;

		var userGame = {
			lastUnlock: lastUnlock,
			gameId: gameId,
			userId: userId,
			currentGamerscore: game.currentGamerscore,
			earnedAchievements: game.earnedAchievements,
			completed: completed
		};

		userGames.update({ gameId: gameId, userId: userId }, { $set: userGame }, { upsert: true }, function(err, res) {
			if (err) {
				callback({ reason: 'error updating user xbox one games', data: err }, null);
				return;
			}
			console.log('user xbox one games updated');
		});
	});
	callback();
}

xboxApiPrivate._updateXboxOneGameDetails = function(userId, game, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		callback({reason: 'type err STRING LINE 146'}, null);
		return;
	}

	var hexId = game.titleId.toString(16);
	var url = 'game-details-hex/' + hexId;
	var gameDetails = db.collection('gamedetails');

	xboxApiCaller(url, function(err, result) {
		if (err) {
			callback(err, null);
			return;
		}

		if (!result || !result.Items || !result.Items[0]) {
			callback({reason: 'data does not have Items', data: err}, null);
			return;
		}

		var gameDetail = {
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

		gameDetails.update({ gameId: gameId }, { $set: gameDetail }, { upsert: true }, function(err, res) {
			if (err) {
				callback({ reason: 'error updating xbox one game details', data: err }, null);
				return;
			}
			console.log('xbox one game details updated');
		});
	});
	
	callback();
}

xboxApiPrivate._updateXbox360AchievementsData = function(userId, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		callback({reason: 'type err STRING LINE 193'}, null);
		return;
	}

	db.collection('users').findOne({ _id: userId }, function(err, user) {
		if (err) {
			callback({ reason: 'the db find has an error', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			callback({ reason: 'the users gamertag was not scanned' }, null);
			return;
		}

		var url = user.xuid + '/achievements/' + gameId;
		var xbdAchievements = db.collection('xbdachievements');
		var userAchievements = db.collection('userachievements');

		xboxApiCaller(url, function(err, data) {
			if (err) {
				callback(err, null);
				return;
			}

			if (typeof data.forEach !== 'function') {
				callback({reason: 'data does not have a forEach, is not an array', data: data}, null);
				return;
			}
			
			data.forEach(function(achievement) {
				var progressState = (achievement.unlocked !== false) ? true : false;
				var progression = new Date(achievement.timeUnlocked);
				var achievementInserted = false;

				xbdAchievements.findOne({ gameId: gameId, name: achievement.name }, function(err, achievementCheck) {
					if (err) {
						callback({ reason: 'xbdAchievements find failed', data: err }, null);
					}

					if (!achievementCheck) {
						var singleAchievement = {
							gameId: gameId,
							name: achievement.name,
							mediaAssets: achievement.imageUnlocked,
							isSecret: achievement.isSecret,
							description: achievement.description,
							lockedDescription: achievement.lockedDescription,
							value: achievement.gamerscore,
							userPercentage: 0
						};
						achievementCheck = xbdAchievements.insert(singleAchievement);
						achievementInserted = true;
					}

					if (!achievementInserted) {
						achievementCheck = achievementCheck._id;
					}

					var userAchievement = {
						achievementId: achievementCheck,
						userId: userId,
						progressState: progressState,
						progression: progression
					};

					userAchievements.update({ achievementId: achievementCheck, userId: userId }, { $set: userAchievement }, { upsert: true }, function(err, res) {
						if (err) {
							callback({ reason: 'error updating user acheivements', data: err }, null);
							return;
						}
						console.log('user achievements updated');
					});
				});
			});
		});
	});
	callback();
}

xboxApiPrivate._updateXbox360GameData = function(userId, game, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		callback({reason: 'type err STRING LINE 274'}, null);
		return;
	}

	var xbdGames = db.collection('xbdgames');
	var userGames = db.collection('usergames');
	var gameInserted = false;

	xbdGames.findOne({ _id: gameId }, function(err, gameCheck) {
		if (err) {
			callback({ reason: 'the db find has an error', data: err }, null);
			return;
		}
		if (!gameCheck) {
			var singleGame = {
				_id: gameId,
				platform: 'Xenon',
				name: game.name,
				titleType: game.titleType,
				maxGamerscore: game.totalGamerscore
			};
			gameCheck = xbdGames.insert(singleGame);
			gameInserted = true;
		}
		
		var lastPlayed = new Date(game.lastPlayed);
		var completed = game.totalGamerscore > game.currentGamerscore ? false : true;

		var userGame = {
			lastUnlock: lastPlayed,
			gameId: gameId,
			userId: userId,
			currentGamerscore: game.currentGamerscore,
			earnedAchievements: game.currentAchievements,
			completed: completed
		};

		userGames.update({ gameId: gameId, userId: userId }, { $set: userGame }, { upsert: true }, function(err, res) {
			if (err) {
				callback({ reason: 'error updating user xbox 360/other games', data: err }, null);
				return;
			}
			console.log('user xbox 360/other games updated');
		});
	});
	callback();
}

xboxApiPrivate._updateXbox360GameDetails = function(userId, game, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') {
		callback({reason: 'type err STRING LINE 319'}, null);
		return;
	}

	var gameDetails = db.collection('gamedetails');

	gameDetails.findOne({ gameId: gameId }, function(err, gameCheck) {
		if (err) {
			callback({ reason: 'the db find has an error', data: err }, null);
			return;
		}
		if (gameCheck) {
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
				if (result && result.Items) {
					var releaseDate = (typeof result.Items[0].ReleaseDate !== 'undefined') ? result.Items[0].ReleaseDate : result.Items[0].Updated;
					releaseDate = new Date(parseInt(releaseDate.substr(6)));
					releaseDate = releaseDate.toISOString();
					var allTimeAverageRating = (typeof result.Items[0].AllTimeAverageRating !== 'undefined') ? result.Items[0].AllTimeAverageRating : 0;
					var gameDetail = {
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
					var gameDetail = {
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
					console.log('xbox 360 or other game details inserted');
				});

			});
		}
	});
	callback();
}

xboxApiPrivate._dirtyCheckXboxOneGames = function(user, callback) {
	if (typeof user !== 'string') {
		callback({ reason: 'type err STRING line 405'}, null);
		return;
	}
	if (!user || !user.gamertagScanned) {
		callback({ reason: 'the users gamertag was not scanned' }, null);
		return;
	}

	var self = this;
	var url = user.xuid + '/xboxonegames';
	var userLastUpdate = user.gamertagScanned.lastUpdate;

	xboxApiCaller(url, function(err, result) {
		if (err) {
			callback(err, null);
			return;
		}
		if (!result.titles || typeof result.titles.forEach !== 'function') {
			callback({reason: 'there are no games in the result'}, null);
			return;
		}
		result.titles.forEach(function (game) {
			if (game.maxGamerscore ===  0) return;
			
			var gameId = game.titleId.toString();
			var gameLastUnlock = new Date(game.lastUnlock);

			console.log(game.name + " last unlock is " + gameLastUnlock);
			console.log("user last update is " + userLastUpdate);

			if (gameLastUnlock < userLastUpdate) {
				console.log(game.name + " does not need updating");
				return;
			}

			xboxApiPrivate._updateXboxOneAchievementsData(user._id, gameId, function(err, result) {
				if (err) {
					callback(err, null);
				}
			});
			xboxApiPrivate._updateXboxOneGameData(user._id, game, gameId, function(err, result) {
				if (err) {
					callback(err, null);
				}
			});
			xboxApiPrivate._updateXboxOneGameDetails(user._id, game, gameId, function(err, result) {
				if (err) {
					callback(err, null);
				}
			});
		});

	});
	callback();
}

xboxApiPrivate._dirtyCheckXbox360Games = function (user, callback) {
	if (typeof user !== 'string') {
		callback({ reason: 'type err STRING line 443'}, null);
		return;
	}
	
	var self = this;
	var url = user.xuid + '/xbox360games';
	var userLastUpdate = user.gamertagScanned.lastUpdate;

	xboxApiCaller(url, function(err, result) {
		if (err) {
			callback(err, null);
			return;
		}
		if (!result.titles || typeof result.titles.forEach !== 'function') {
			callback({reason: 'there are no titles in the result'}, null);
			return;
		}
		result.titles.forEach(function (game) {
			if (game.totalGamerscore ===  0) return;

			var gameId = game.titleId.toString();

			var gameLastPlayed = new Date(game.lastPlayed);
			if (gameLastPlayed < userLastUpdate) {
				console.log(game.name + " does not need updating");
				return;
			}

			xboxApiPrivate._updateXbox360AchievementsData(user._id, gameId, function(err, result) {
				if (err) {
					callback(err, null);
				}
			});
			xboxApiPrivate._updateXbox360GameData(user._id, game, gameId, function(err, result) {
				if (err) {
					callback(err, null);
				}
			});
			xboxApiPrivate._updateXbox360GameDetails(userId, game, gameId, function(err, result) {
				if (err) {
					callback(err, null);
				}
			});
		});

	});
	callback();
}

module.exports = xboxApiPrivate;