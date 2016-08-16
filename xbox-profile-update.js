var xboxApiObject = require('./xbox-api.js');
var xboxApiCaller = require('./xbox-api-caller.js');
var db = require('./db.js');
var userId = 'YP5iXtDHda5E7ZMXH';

xboxApiObject.updateXboxProfile(userId, function(err) {
	console.log(userId + 'is done');
});

// var db = require('./db.js');
// var users = db.collection('users');
// var userId = 'YP5iXtDHda5E7ZMXH';
// var gtSlugify = require('./gamertag-slugify.js');

// users.findOne({ _id: userId }, function(err, user) {
// 	console.log(user.xboxProfile);
// 	if (user.gamercard) {
// 		gtSlugify.gamercardSlugify(userId, user.gamercard, function(err) {
// 			console.log(userId + " " + user.gamercard);
// 		});
// 	} else {
// 		gtSlugify.xboxProfileSlugify(userId, user.xboxProfile, function(err) {
// 			console.log(userId + " " + user.xboxProfile);
// 		});
// 	}
// });