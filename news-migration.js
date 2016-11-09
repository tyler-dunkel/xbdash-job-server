var mongoJS = require('mongojs');
// var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var meteorUrl = 'mongodb://xbadmin:tda88f552e87k15g@capital.4.mongolayer.com:10130,capital.5.mongolayer.com:10130/xbdash-production?replicaSet=set-569077792b73d794a800039f';

var db = mongoJS(meteorUrl);

var migrate = function() {
	var xbdNews = db.collection('xbdnews');

	xbdNews.update({}, { $set: { "shareImage": "https://www.xbdash.com/img/news-default.jpg" } }, { multi: true }, function(err, res) {
		if (err) {
			console.log('news fields problem');
		}
		if (res) {
			console.log('news fields updated');
		}
	});

	// var gameDetails = db.collection('gamedetails');

	// xboxApiPrivate._updateXboxOneGameDetails = function(userId, game, gameId, callback) {
	// 	if (typeof userId !== 'string' || typeof gameId !== 'string') {
	// 		console.log('_updateXboxOneGameDetails. userId passed is not a string');
	// 		callback({ reason: 'type err STRING LINE 195' }, null);
	// 		return;
	// 	}

	// 	var hexId = game.titleId.toString(16);
	// 	var url = 'game-details-hex/' + hexId;
	// 	var gameDetails = db.collection('gamedetails');
	// 	    gameId = game.titleId.toString();

	// 	console.log('starting game detail scan of: ' + game.name + ' at: ' + moment().format());
	// 	xboxApiCaller(url, function(err, result) {
	// 		if (err) {
	// 			callback(err, null);
	// 			return;
	// 		}
	// 		if (!result || !result.Items || !result.Items[0]) {
	// 			console.log('xbox one game details api response is not an array at: ' + moment().format());
	// 			callback({ reason: 'data does not have Items', data: err }, null);
	// 			return;
	// 		}

	// 		gameDetails.findOne({ gameId: gameId }, function(err, gameCheck) {

	// 			if (!gameCheck) {
	// 				console.log('game details for: ' + game.name + ' not found in the db. inserting now');
	// 				var _id = randomstring.generate(17);

	// 				var gameDetail = {
	// 					_id: _id,
	// 					gameName: game.name,
	// 					gameDescription: result.Items[0].Description,
	// 					gameReducedDescription: result.Items[0].ReducedDescription,
	// 					gameReducedName: result.Items[0].ReducedName,
	// 					gameReleaseDate: new Date(result.Items[0].ReleaseDate),
	// 					gameId: gameId,
	// 					gameGenre: result.Items[0].Genres,
	// 					gameArt: result.Items[0].Images,
	// 					gameDeveloperName: result.Items[0].DeveloperName,
	// 					gamePublisherName: result.Items[0].PublisherName,
	// 					gameParentalRating: result.Items[0].ParentalRating,
	// 					gameAllTimePlayCount: result.Items[0].AllTimePlayCount,
	// 					gameSevenDaysPlayCount: result.Items[0].SevenDaysPlayCount,
	// 					gameThirtyDaysPlayCount: result.Items[0].ThirtyDaysPlayCount,
	// 					gameAllTimeRatingCount: result.Items[0].AllTimeRatingCount,
	// 					gameAllTimeAverageRating: result.Items[0].AllTimeAverageRating
	// 				};

	// 				if (gameDetail.releaseDate > new Date()) {
	// 					gameDetail.releaseDate = new Date();
	// 				}
					
	// 				gameDetails.insert(gameDetail, function(err) {
	// 					if (err) {
	// 						console.log('db insert error');
	// 						callback && callback();
	// 					}
	// 					console.log('ending game detail scan of: ' + game.name + ' at: ' + moment().format());
	// 					callback && callback();
	// 				});
	// 			} else {
	// 				console.log('ending game detail scan of: ' + game.name + ' at: ' + moment().format());
	// 				callback && callback();
	// 			}
	// 		});
	// 	});
	// }

}

migrate();