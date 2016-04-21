// var xboxApiObject = require('./xbox-api.js');
// var createAndBuild = require('./leaderboards-api/create-and-build.js');
// var db = require('./db.js');

// xboxApiObject.updateXboxOneData('Aga8YoyneRZBD4mJf', function(err, res) {
// 	if (err) {
// 		console.log('error with update x1 games');
// 		callback && callback();
// 		return;
// 	}
// 	console.log('update xbox one data done, moving to x360');
// });

// xboxApiObject.updateXbox360Data('Aga8YoyneRZBD4mJf', function(err, res) {
// 	if (err) {
// 		console.log('error with update 360 games');
// 		callback && callback();
// 		return;
// 	}
// 	console.log('updated x360 data');
// });

// db.collection('users').update({ _id: 'Aga8YoyneRZBD4mJf' }, { $set: { 'gamertagScanned.status': "true", 'gamertagScanned.lastUpdate': new Date() } }, function(err, res) {
// 	if (err) {
// 		console.log('error in db update');
// 		callback && callback();
// 		return;
// 	}
// 	console.log('lastUpdate updated');
// });

// createAndBuild('Aga8YoyneRZBD4mJf', function(err, res) {
// 	if (err) {
// 		console.log(err);
// 		callback && callback();
// 		return;
// 	}
// 	console.log('done creating and building');
// });