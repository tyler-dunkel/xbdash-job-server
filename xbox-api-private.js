var Client = require('mongodb').MongoClient;
var format = require('util').format;
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var xboxApiCaller = require('./xbox-api-caller.js');

var xboxApiPrivate = xboxApiPrivate || {};

xboxApiPrivate._updateXboxOneAchievementsData = function(userId, gameId, callback) {
	if (typeof userId !== 'string' || typeof gameId !== 'string') return;

	Client.connect(meteorUrl, function (err, db) {
		if (err) throw err;

		var users = db.collection('users');

		users.find({ _id: userId }).limit(1).next(function(err, user) {
			if (err) {
				db.close();
				throw err;
			}
			if (!user || !user.gamertagScanned) return;

			var url = user.xuid + '/achievements/' + gameId;
			var xbdAchievements = db.collection('xbdachievements');
			var userAchievements = db.collection('userachievements');

			xboxApiCaller(url, function(err, data) {
				if (err) throw err;

				data.forEach(function(achievement) {
					console.log(achievement.progressState);
					// var achievementCheck = xbdAchievements.find({ gameId: gameId, name: achievement.name }).limit(1).next(function(err, achievement) {
					// 	console.log(achievement);
					// 	var achievementCheck = xbdAchievements.findOne({ gameId: gameId, name: achievement.name });
					// });
					// var achievementCheck = xbdAchievements.findOne({ gameId: gameId, name: achievement.name });
					// var progressState = (achievement.progressState !== 'NotStarted') ? true : false;
					// var progression = achievement.progression.timeUnlocked;
					// progression = new Date(progression);
					// var achievementInserted = false;
					// var achievementValue = achievement.rewards && achievement.rewards.length ? achievement.rewards[0].value : achievement.value;

					// if (!achievementCheck) {
					// 	var singleAchievement = {
					// 		gameId: gameId,
					// 		name: achievement.name,
					// 		mediaAssets: achievement.mediaAssets[0].url,
					// 		isSecret: achievement.isSecret,
					// 		description: achievement.description,
					// 		lockedDescription: achievement.lockedDescription,
					// 		value: achievementValue,
					// 		userPercentage: 0
					// 	};
					// 	achievementCheck = xbdAchievements.insert(singleAchievement);
					// 	achievementInserted = true;
					// }

					// if (!achievementInserted) {
					// 	achievementCheck = achievementCheck._id;
					// }

					// var userAchievement = {
					// 	achievementId: achievementCheck,
					// 	userId: userId,
					// 	progressState: progressState,
					// 	progression: progression
					// };

					// userAchievements.upsert({ achievementId: achievementCheck, userId: userId }, { $set: userAchievement });
				});

				// for (var achievement in res) {
				// 	console.log(achievement+": "+res[achievement]);
				// }

				// console.log('test');
			});
		});

		if (err) {
			if (err.response) {
				var errorCode = err.response.data.code;
				var errorMessage = err.response.data.message;
			} else {
				var errorCode = 500;
				var errorMessage = 'Cannot access the API';
			}
			var myError = new Error(errorCode, errorMessage);
			callback(myError, null);
		}
	});
}

// xboxApiPrivate._updateXboxOneGameData = function(userId, game, gameId) {
// 	var gameCheck = xbdGames.findOne({ _id: gameId });
// 	var lastUnlock = game.lastUnlock;
// 	lastUnlock = new Date(lastUnlock);
// 	var gameInserted = false;

// 	if (!gameCheck) {
// 		var singleGame = {
// 			_id: gameId,
// 			platform: game.platform,
// 			name: game.name,
// 			titleType: game.titleType,
// 			maxGamerscore: game.maxGamerscore
// 		};
// 		gameCheck = xbdGames.insert(singleGame);
// 		gameInserted = true;
// 	}

// 	if (!gameInserted) {
// 		gameCheck = gameCheck._id;
// 	}

// 	var completed = game.maxGamerscore > game.currentGamerscore ? false : true;

// 	var userGame = {
// 		lastUnlock: lastUnlock,
// 		gameId: gameId,
// 		userId: userId,
// 		currentGamerscore: game.currentGamerscore,
// 		earnedAchievements: game.earnedAchievements,
// 		completed: completed
// 	};
// 	userGames.upsert({ gameId: gameId, userId: userId }, { $set: userGame });
// }

// xboxApiPrivate._updateXboxOneGameDetails = function(userId, game, gameId) {
// 	var hexId = game.titleId.toString(16);
// 	var url = 'game-details-hex/' + hexId;

// 	try {
// 		var result = syncApiCaller(url);
// 	} catch (e) {
// 		return;
// 	}

// 	if (!result || !result.data || !result.data.Items) {
// 		return;
// 	}

// 	var gameDetail = {
// 		gameName: game.name,
// 		gameDescription: result.data.Items[0].Description,
// 		gameReducedDescription: result.data.Items[0].ReducedDescription,
// 		gameReducedName: result.data.Items[0].ReducedName,
// 		gameReleaseDate: result.data.Items[0].ReleaseDate,
// 		gameId: gameId,
// 		gameGenre: result.data.Items[0].Genres,
// 		gameArt: result.data.Items[0].Images,
// 		gamePublisherName: result.data.Items[0].PublisherName,
// 		gameParentalRating: result.data.Items[0].ParentalRating,
// 		gameAllTimePlayCount: result.data.Items[0].AllTimePlayCount,
// 		gameSevenDaysPlayCount: result.data.Items[0].SevenDaysPlayCount,
// 		gameThirtyDaysPlayCount: result.data.Items[0].ThirtyDaysPlayCount,
// 		gameAllTimeRatingCount: result.data.Items[0].AllTimeRatingCount,
// 		gameAllTimeAverageRating: result.data.Items[0].AllTimeAverageRating
// 	};

// 	gameDetails.upsert({ gameId: gameId }, { $set: gameDetail });
// }

// xboxApiPrivate._updateXbox360AchievementsData = function(userId, gameId) {
// 	var user = Meteor.users.findOne({ _id: userId });
// 	var url = user.xuid + '/achievements/' + gameId;
	
// 	try {
// 		var result = syncApiCaller(url);
// 	} catch (e) {
// 		return;
// 	}

// 	if (!result || !result.data) {
// 		return;
// 	}

// 	if (_.isEmpty(result.data)) {
// 		return;
// 	}

// 	try {
// 		result.data.forEach(function (achievement) {
// 			var achievementCheck = xbdAchievements.findOne({ gameId: gameId, name: achievement.name });
// 			var progressState = (achievement.unlocked !== false) ? true : false;
// 			var progression = new Date(achievement.timeUnlocked);
// 			var achievementInserted = false;

// 			if (typeof achievementCheck === 'undefined') {
// 				var singleAchievement = {
// 					gameId: gameId,
// 					name: achievement.name,
// 					mediaAssets: achievement.imageUnlocked,
// 					isSecret: achievement.isSecret,
// 					description: achievement.description,
// 					lockedDescription: achievement.lockedDescription,
// 					value: achievement.gamerscore,
// 					userPercentage: 0
// 				};
// 				achievementCheck = xbdAchievements.insert(singleAchievement);
// 				achievementInserted = true;
// 			}

// 			if (!achievementInserted) {
// 				achievementCheck = achievementCheck._id;
// 			}

// 			var userAchievement = {
// 				achievementId: achievementCheck,
// 				userId: userId,
// 				progressState: progressState,
// 				progression: progression
// 			};

// 			userAchievements.upsert({ achievementId: achievementCheck, userId: userId }, { $set: userAchievement });
// 		});
// 	} catch (error) {
// 		return;
// 	}
// }

// xboxApiPrivate._updateXbox360GameData = function(userId, game, gameId) {
// 	var gameCheck = xbdGames.findOne({ _id: gameId });
// 	var lastPlayed = new Date(game.lastPlayed);
// 	var gameInserted = false;

// 	if (typeof gameCheck === 'undefined') {
// 		var singleGame = {
// 			_id: gameId,
// 			platform: 'Xenon',
// 			name: game.name,
// 			titleType: game.titleType,
// 			maxGamerscore: game.totalGamerscore
// 		};
// 		gameCheck = xbdGames.insert(singleGame);
// 		gameInserted = true;
// 	}

// 	// if (!gameInserted) {
// 	// 	gameCheck = gameCheck._id;
// 	// }

// 	var completed = game.totalGamerscore > game.currentGamerscore ? false : true;

// 	var userGame = {
// 		lastUnlock: lastPlayed,
// 		gameId: gameId,
// 		userId: userId,
// 		currentGamerscore: game.currentGamerscore,
// 		earnedAchievements: game.currentAchievements,
// 		completed: completed
// 	};
// 	userGames.upsert({ gameId: gameId, userId: userId }, { $set: userGame });
// }

// xboxApiPrivate._updateXbox360GameDetails = function(userId, game, gameId) {
// 	var gameCheck = gameDetails.findOne({ gameId: gameId });
// 	var hexId = game.titleId.toString(16);
// 	var url = 'game-details-hex/' + hexId;

// 	if (gameCheck) return;

// 	try {
// 		var result = syncApiCaller(url);
// 	} catch (e) {
// 		return;
// 	}

// 	if (result && result.data && result.data.Items) {
// 		var releaseDate = (typeof result.data.Items[0].ReleaseDate !== 'undefined') ? result.data.Items[0].ReleaseDate : result.data.Items[0].Updated;
		
// 		releaseDate = new Date(parseInt(releaseDate.substr(6)));
// 		releaseDate = releaseDate.toISOString();
		
// 		var allTimeAverageRating = (typeof result.data.Items[0].AllTimeAverageRating !== 'undefined') ? result.data.Items[0].AllTimeAverageRating : 0;
// 		var gameDetail = {
// 			gameName: game.name,
// 			gameDescription: result.data.Items[0].Description,
// 			gameReducedDescription: result.data.Items[0].ReducedDescription,
// 			gameReducedName: result.data.Items[0].ReducedName,
// 			gameReleaseDate: releaseDate,
// 			gameId: gameId,
// 			gameGenre: result.data.Items[0].Genres,
// 			gameArt: result.data.Items[0].Images,
// 			gamePublisherName: result.data.Items[0].PublisherName,
// 			gameParentalRating: result.data.Items[0].ParentalRating, // undefined
// 			gameAllTimePlayCount: result.data.Items[0].AllTimePlayCount, // undefined
// 			gameSevenDaysPlayCount: result.data.Items[0].SevenDaysPlayCount, // undefined
// 			gameThirtyDaysPlayCount: result.data.Items[0].ThirtyDaysPlayCount, // undefined
// 			gameAllTimeRatingCount: result.data.Items[0].AllTimeRatingCount, // undefined
// 			gameAllTimeAverageRating: allTimeAverageRating
// 		};
// 	} else {
// 		var gameDetail = {
// 			gameName: game.name,
// 			gameDescription: "This is the Windows version of the Xbox 360 game: " + game.name,
// 			gameReducedDescription: "This is the Windows version of the Xbox 360 game: " + game.name,
// 			gameReducedName: game.name,
// 			gameReleaseDate: "2005-11-22T00:00:00Z",
// 			gameId: gameId,
// 			gameGenre: [{ Name: "Miscellaneous" }],
// 			gameArt: [{ Url: "/img/game-default.png" }],
// 			gamePublisherName: "Games for Windows",
// 			gameParentalRating: "Everyone",
// 			gameAllTimePlayCount: 0,
// 			gameSevenDaysPlayCount: 0,
// 			gameThirtyDaysPlayCount: 0,
// 			gameAllTimeRatingCount: 0,
// 			gameAllTimeAverageRating: 0
// 		};
// 	}
// 	gameDetails.insert(gameDetail);
// }

// xboxApiPrivate._dirtyCheckXboxOneGames = function(user) {
	
// 	var self = this;
// 	var url = user.xuid + '/xboxonegames';
// 	var userLastUpdate = user.gamertagScanned.lastUpdate;

// 	try {
// 		var response = syncApiCaller(url);
// 	} catch (e) {
// 		return;
// 	}

// 	if (!response || !response.data || !response.data.titles) {
// 		return;
// 	}

// 	response.data.titles.forEach(function (game) {
// 		if (game.maxGamerscore ===  0) return;
		
// 		var gameId = game.titleId.toString();

// 		var gameLastUnlock = new Date(game.lastUnlock);

// 		console.log(game.name + " last unlock is " + gameLastUnlock);
// 		console.log("user last update is " + userLastUpdate);

// 		if (gameLastUnlock < userLastUpdate) {
// 			console.log(game.name + " does not need updating");
// 			return;
// 		}

// 		self._updateXboxOneAchievementsData(user._id, gameId);
// 		self._updateXboxOneGameData(user._id, game, gameId);
// 		self._updateXboxOneGameDetails(user._id, game, gameId);
// 	});
// }

// xboxApiPrivate._dirtyCheckXbox360Games = function (user) {
	
// 	var self = this;
// 	var url = user.xuid + '/xbox360games';
// 	var userLastUpdate = user.gamertagScanned.lastUpdate;

// 	try {
// 		var response = syncApiCaller(url);
// 	} catch (e) {
// 		return;
// 	}

// 	if (!response || !response.data || !response.data.titles) {
// 		return;
// 	}

// 	response.data.titles.forEach(function (game) {
// 		if (game.totalGamerscore ===  0) return;

// 		var gameId = game.titleId.toString();

// 		var gameLastPlayed = new Date(game.lastPlayed);
// 		if (gameLastPlayed < userLastUpdate) {
// 			console.log(game.name + " does not need updating");
// 			return;
// 		}

// 		self._updateXbox360AchievementsData(user._id, gameId);
// 		self._updateXbox360GameData(user._id, game, gameId);
// 		self._updateXbox360GameDetails(user._id, game, gameId);
// 	});
// }

module.exports = xboxApiPrivate;