var mongoJS = require('mongojs');
var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
var moment = require('moment');

var db = mongoJS(meteorUrl);

module.exports = function(user, callback) {
	var userGames = db.collection('usergames');
	var userLeaderboards = db.collection('userleaderboards');

	userGames.count({ userId: user._id, completed: true }, function(err, gameCount) {
		userLeaderboards.update({ userId: user._id }, { $set: { 'completedGames.count': gameCount } }, function (err) {
			callback && callback();
		});
	});
}