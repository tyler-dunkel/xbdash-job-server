var moment = require('moment');
var db = require('../db.js');
var xboxApiObject = require('../xbox-api.js');
var async = require('async');
var timeFrameCounts = require('../leaderboards-api/timeframe-counts.js');
var userAchievements = db.collection('userachievements');
var xbdAchievements = db.collection('xbdachievements');
var userContestEntries = db.collection('usercontestentries');
var userLeaderboards = db.collection('userleaderboards');
var xbdContests = db.collection('xbdcontests');
var users = db.collection('users');


var chooseWinner = function(contest, cb) {
	var rank = 0;
	userContestEntries.find({contestToken: contest.contestToken}).sort({'data.value': -1}).forEach(function(err, entry) {
		if (err) {
			console.log('there was an error finding the contest entries');
			console.log(err);
			cb && cb();
			return;
		}
		if (!entry) {
			xbdContests.update({_id: contest._id}, {$set: {'status': 'complete'}}, function(err) {
				cb && cb();
				return;
			});
		}

		rank++;
		if (rank === 1) {
			userContestEntries.update({_id: entry._id}, {$set: {'data.rank': rank, status: 'winner'}}, function(err) {
				xbdContests.update({_id: contest._id}, {$set: {winnerId: entry.userId}}, function(err) {

				});
			});
		} else {
			userContestEntries.update({_id: entry._id}, {$set: {'data.rank': rank, status: 'complete'}}, function(err) {

			});
		}
	});
}
var scanDailyEntry = function(entry, cb) {
	users.findOne({_id: entry.userId}, function(err, user) {
		if (user) {
			async.series([
				function(callback) {
					xboxApiObject.dirtyUpdateUserStats(user._id, function(err) {
						if (err) {
							console.log('there was an error counting the users achievements ')
						}
						callback();
					});
				},
				function(callback) {
					timeFrameCounts.dailyCount(user, function(err) {
						if (err) {
							console.log('there was an error counting the users achievements ')
						}
						callback();
					});
				}
			], function(err) {
				if (err) {
					console.log('there was an error processing the entry');
				}
				cb();
			});
		} else {
			cb();
		}
	});
}

var scanWeeklyEntry = function(entry, cb) {
	users.findOne({_id: entry.userId}, function(err, user) {
		if (user) {
			async.series([
				function(callback) {
					xboxApiObject.dirtyUpdateUserStats(user._id, function(err) {
						if (err) {
							console.log('there was an error counting the users achievements ');
						}
						callback();
					});
				},
				function(callback) {
					timeFrameCounts.weeklyCount(user, function(err) {
						if (err) {
							console.log('there was an error counting the users achievements ');
						}
						callback();
					});
				}
			], function(err) {
				if (err) {
					console.log('there was an error processing the entry');
				}
				cb();
			});
		}
	});
}

var scanMonthlyEntry = function(entry, cb) {
	users.findOne({_id: entry.userId}, function(err, user) {
		if (user) {
			async.series([
				function(callback) {
					xboxApiObject.dirtyUpdateUserStats(user._id, function(err) {
						if (err) {
							console.log('there was an error counting the users achievements ');
						}
						callback();
					});
				},
				function(callback) {
					timeFrameCounts.monthlyCount(user, function(err) {
						if (err) {
							console.log('there was an error counting the users achievements ');
						}
						callback();
					});
				}
			], function(err) {
				if (err) {
					console.log('there was an error processing the entry');
				}
				cb();
			});
		}
	});
}

module.exports= {
	scanDailyEntry: scanDailyEntry,
	scanWeeklyEntry: scanWeeklyEntry,
	scanMonthlyEntry: scanMonthlyEntry
}
