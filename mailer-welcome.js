var mailgun = require('mailgun-js')({ apiKey: 'key-e3bf4d16353fe8dbe0066aa6a164d479', domain: 'email.xbdash.com' });
var nunjucks = require('nunjucks');
var db = require('./db.js');

nunjucks.configure('emails', { watch: true });

var welcomeEmailSend = function(userId, cb) {
	var userEmail;
	var users = db.collection('users');
	var userAchievements = db.collection('userachievements');
	var userGames = db.collection('usergames');

	users.findOne({ _id: userId }, function(err, user) {
		if (err) {
			console.log('callback on line 16 called (error on user lookup)');
			cb && cb({ reason: 'the db find was an error', data: err }, null);
			return;
		}
		if (!user || !user.gamertagScanned) {
			console.log('callback on line 21 called (gamertagScanned is false or null)');
			cb && cb({ reason: 'the users gamertag was not scanned' }, null);
			return;
		}

        userAchievements.find({ userId: userId, progressState: true }).count(function(err, userAchievementsCount) {
			if (err) {
				cb && cb(err, null);
				return;
			}
			userAchievements.find({ userId: userId }).count(function(err, userTotalAchievements) {
				if (err) {
					cb && cb(err, null);
					return;
				}
				userGames.find({ userId: userId, completed: true }).count(function(err, userGamesCount) {
					if (err) {
						cb && cb(err, null);
						return;
					}
					userGames.find({ userId: userId }).count(function(err, userTotalGames) {
						if (err) {
							cb && cb(err, null);
							return;
						}
						
						var welcomeEmail = nunjucks.render('welcome-email.html', {
							fName: user.gamercard.gamertag,
							aCount: userAchievementsCount,
							atCount: userTotalAchievements,
							gCount: userGamesCount,
							gtCount: userTotalGames
						});

						if (user.services) {
							if (user.services.facebook) {
								userEmail = user.services.facebook.email;
							} else if (user.services.twitter) {
								userEmail = user.services.twitter.email;
							} else {
								userEmail = user.emails[0].address;
							}
						} else {
							userEmail = user.emails[0].address;
						}

						mailgun.messages().send({
							from: "XBdash <contact@email.xbdash.com>",
						    to: userEmail,
						    subject: "Welcome to XBdash, " + user.gamercard.gamertag,
							html: welcomeEmail,
							'o:tag': 'welcome-message',
							'o:tracking-clicks': 'yes',
							'o:tracking-opens': 'yes'
						}, function (err, body) {
							if (err) {
								console.log('mailgun did not send');
								cb && cb({ reason: 'mailgun did not send', data: err }, null);
								return;
							}
							cb && cb();
						});
					});
				});
			});
		});
	});
}

module.exports = welcomeEmailSend;