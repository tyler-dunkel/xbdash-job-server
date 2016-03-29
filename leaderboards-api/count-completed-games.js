var moment = require('moment');
var db = require('../db.js');

module.exports = function(user, callback) {
	var userGames = db.collection('usergames');
	var userLeaderboards = db.collection('userleaderboards');

	userGames.count({ userId: user._id, completed: true }, function(err, gameCount) {
		userLeaderboards.update({ userId: user._id }, { $set: { 'completedGames.count': gameCount } }, function (err) {
			callback && callback();
		});
	});
}