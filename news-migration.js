var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
// var meteorUrl = 'mongodb://xbadmin:tda88f552e87k15g@capital.4.mongolayer.com:10130,capital.5.mongolayer.com:10130/xbdash-production?replicaSet=set-569077792b73d794a800039f';

var db = mongoJS(meteorUrl);

var migrate = function() {
	// var xbdNews = db.collection('xbdnews');

	// xbdNews.update({}, { $set: { "shareImage": "https://www.xbdash.com/img/news-default.jpg" } }, { multi: true }, function(err, res) {
	// 	if (err) {
	// 		console.log('news fields problem');
	// 	}
	// 	if (res) {
	// 		console.log('news fields updated');
	// 	}
	// });

	var gameDetails = db.collection('gamedetails');

	// gameDetails.find({ "gameDescription": /This game requires a Kinect™ Sensor. /g }).forEach(function(err, doc) {
	// 	if (err) {
	// 		console.log('finished replacing')
	// 	}
		
	// 	doc.gameDescription = doc.gameDescription.replace(/This game requires a Kinect™ Sensor. /g,"");
	// 	gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
	// 			if (err) {
	// 				console.log('problem occured while replacing');
	// 			}
	// 			if (res) {
	// 				console.log('all text replaced');
	// 			}
	// 		}
	// 	);
	// });

	gameDetails.find({ "gameDescription": /This game supports English, French, Italian, German, and Spanish. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English, French, Italian, German, and Spanish. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English only. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English only. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /The Games on Demand version supports English, French, German, Czech, Finnish, Russian, Swedish.  /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/The Games on Demand version supports English, French, German, Czech, Finnish, Russian, Swedish.  /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English./g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English./g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English, French, Italian, German, and German. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English, French, Italian, German, and German. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English, Italian, Spanish, and Dutch. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English, Italian, Spanish, and Dutch. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English, French, and German. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English, French, and German. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports Japanese only.  /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports Japanese only.  /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English, French, Italian, German, Spanish, Japanese, and Korean. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English, French, Italian, German, Spanish, Japanese, and Korean. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English and French only. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English and French only. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English, Spanish, and French. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English, Spanish, and French. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English and French. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English and French. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English, French, and Spanish. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English, French, and Spanish. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": / There are no refunds for this item. For more information, see www.xbox.com\/live\/accounts./g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/ There are no refunds for this item. For more information, see www.xbox.com\/live\/accounts./g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /\(Online Interactions Not Rated by the ESRB\) /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/\(Online Interactions Not Rated by the ESRB\) /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /This game supports English, French, Italian, and Spanish. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/This game supports English, French, Italian, and Spanish. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	// gameDetails.find({ "gameDescription": /This game supports (.)*\w.[.]  */g }).forEach(function(err, doc) {
	// 	if (err) {
	// 		console.log('error occured while replacing');
	// 	}

	// 	if (doc === null) {
	// 		console.log("its null");
	// 		return;
	// 	}

	// 	doc.gameDescription = doc.gameDescription.replace(/This game supports (.)*\w.[.]  */g,"");
	// 	gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
	// 		if (err) {
	// 			console.log('problem occured while replacing');
	// 		}
	// 		if (res) {
	// 			console.log('all text replaced');
	// 		}
	// 	});

	// 	if (doc == null) { console.log('replaced all strings') };
	// });

	gameDetails.find({ "gameDescription": /The downloadable version (.)*\w.[.] */g }).forEach(function(err, doc) {
		if (err) {
			console.log('error occured while replacing');
		}

		if (doc === null) {
			console.log("its null");
			return;
		}

		doc.gameDescription = doc.gameDescription.replace(/The downloadable version (.)*\w.[.] */g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
			if (err) {
				console.log('problem occured while replacing');
			}
			if (res) {
				console.log('all text replaced');
			}
		});

		if (doc == null) { console.log('replaced all strings') };
	});

	gameDetails.find({ "gameDescription": /Download the manual for this game by (.)*\"\. /g }).forEach(function(err, doc) {
		if (err) {
			console.log('finished replacing')
		}

		if (doc === null) {
			console.log("its null");
			return;
		}
		
		doc.gameDescription = doc.gameDescription.replace(/Download the manual for this game by (.)*\"\. /g,"");
		gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
				if (err) {
					console.log('problem occured while replacing');
				}
				if (res) {
					console.log('all text replaced');
				}
			}
		);
	});

	// gameDetails.find({ "gameDescription": /Download the manual for this game by going to https\:\/\/help\.ea\.com\/en\/tag\/manuals and selecting your title from the Product drop down menu\. /g }).forEach(function(err, doc) {
	// 	if (err) {
	// 		console.log('error occured while replacing');
	// 	}

	// 	doc.gameDescription = doc.gameDescription.replace(/Download the manual for this game by going to https\:\/\/help\.ea\.com\/en\/tag\/manuals and selecting your title from the Product drop down menu\. /g,"");
	// 	gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
	// 			if (err) {
	// 				console.log('problem occured while replacing');
	// 			}
	// 			if (res) {
	// 				console.log('all text replaced');
	// 			}
	// 		});

	// 	if (doc == null) { console.log('replaced all strings') };
	// });

	// gameDetails.find({ "gameDescription": /           /g }).forEach(function(err, doc) {
	// 	if (err) {
	// 		console.log('error occured while replacing');
	// 	}

	// 	doc.gameDescription = doc.gameDescription.replace(/           /g," ");
	// 	gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
	// 		if (err) {
	// 			console.log('problem occured while replacing');
	// 		}
	// 		if (res) {
	// 			console.log('all text replaced');
	// 		}
	// 	});

	// 	if (doc == null) { console.log('replaced all strings') };
	// });

	// gameDetails.find({ "gameDescription": /The Games on Demand version supports (.)*\. */ig }).forEach(function(err, doc) {
	// 	if (err) {
	// 		console.log('error occured while replacing');
	// 	}

	// 	if (doc === null) {
	// 		console.log("its null");
	// 		return;
	// 	}

	// 	doc.gameDescription = doc.gameDescription.replace(/The Games on Demand version supports (.)*\. */ig,"");
	// 	gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
	// 		if (err) {
	// 			console.log('problem occured while replacing');
	// 		}
	// 		if (res) {
	// 			console.log('all text replaced');
	// 		}
	// 	});
	// });

	// gameDetails.find({ "gameDescription": /Download the manual for this (.)*\.. /ig }).forEach(function(err, doc) {
	// 	if (err) {
	// 		console.log('error occured while replacing');
	// 	}

	// 	if (doc === null) {
	// 		console.log("its null");
	// 		return;
	// 	}

	// 	doc.gameDescription = doc.gameDescription.replace(/Download the manual for this (.)*\.. /ig,"");
	// 	gameDetails.update({ "_id": doc._id }, { "$set": { "gameDescription": doc.gameDescription } }, { multi: "true" }, function(err, res) {
	// 		if (err) {
	// 			console.log('problem occured while replacing');
	// 		}
	// 		if (res) {
	// 			console.log('all text replaced');
	// 		}
	// 	});
	// });

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