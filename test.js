

// var createAndBuild = require('./leaderboards-api/create-and-build.js');

// createAndBuild('pzWxX8XaDPRgphoDc', function(err, res) {
//  	console.log('the leaderboard build is done');
// });


// var migration = require('./slug-migration.js');

// migration();

var xboxApiObject = require('./xbox-api.js');

xboxApiObject.dirtyUpdateUserStats('dYdZw8dEhYPioLnnM', function(err, res) {
	if (err) {
		console.log(err);
	}
	console.log('callback for dirty stats fired');
});