var xboxApiObject = require('./xbox-api.js');
var xboxApiCaller = require('./xbox-api-caller.js');
var db = require('./db.js');

var userId = 'oMaE9aubMYexTgdZG';
var userId2 = 'kFhehHMFrp9GF7B4M';
var userId3 = 'xLDouGukSMmjQvfT7';
var userId4 = '7q2mpzepdsReQYMfZ';
var userId5 = 'fcvMLfjpWPTijEkvL';
var userId6 = 'Mvi8hhCM7QG38gieg';
var userId7 = 'ZEJ79HY5fsBcCGWuc';
var userId8 = 'tLN8DDv9GvfhF4EAt';

xboxApiObject.updateXboxProfile(userId, function(err) {
	console.log(userId + 'is done');
});

xboxApiObject.updateXboxProfile(userId2, function(err) {
	console.log(userId2 + 'is done');
});

xboxApiObject.updateXboxProfile(userId3, function(err) {
	console.log(userId3 + 'is done');
});

xboxApiObject.updateXboxProfile(userId4, function(err) {
	console.log(userId4 + 'is done');
});

xboxApiObject.updateXboxProfile(userId5, function(err) {
	console.log(userId5 + 'is done');
});

xboxApiObject.updateXboxProfile(userId6, function(err) {
	console.log(userId6 + 'is done');
});

xboxApiObject.updateXboxProfile(userId7, function(err) {
	console.log(userId7 + 'is done');
});

xboxApiObject.updateXboxProfile(userId8, function(err) {
	console.log(userId8 + 'is done');
});
