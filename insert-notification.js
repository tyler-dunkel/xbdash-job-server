var db = require('./db.js');
var randomstring = require('randomstring');
var notifications = db.collection('notifications');

module.exports = function (userId, msg) {
	if (typeof msg !== "string" || typeof userId !== "string") {
		return;
	}
	var _id = randomstring.generate(17);
	notifications.insert({
		_id: _id,
		userId: userId,
		message: msg,
		read: false,
		createdAt: new Date(),
		readAt: null
	});
}