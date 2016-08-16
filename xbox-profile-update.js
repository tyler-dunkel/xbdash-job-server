var xboxApiObject = require('./xbox-api.js');
var xboxApiCaller = require('./xbox-api-caller.js');
var db = require('./db.js');

var userId = 'oMaE9aubMYexTgdZG';

xboxApiObject.updateXboxProfile(userId, function(err) {
	console.log('done!!!');
});