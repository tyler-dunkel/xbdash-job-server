// var createAndBuild = require('./leaderboards-api/create-and-build.js');

// createAndBuild('pzWxX8XaDPRgphoDc', function(err, res) {
//  	console.log('the leaderboard build is done');
// });


var migration = require('./slug-migration.js');

migration();