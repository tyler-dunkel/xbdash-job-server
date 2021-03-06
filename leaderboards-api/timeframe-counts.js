var moment = require('moment');
var db = require('../db.js');

var dailyCount = function (user, callback) {
	var userDailyGamerscore = 0;
	var userLeaderboards = db.collection('userleaderboards');
	var oneDay = moment.utc().startOf('day').toDate();
	var userAchievements = db.collection('userachievements');
	var xbdAchievements = db.collection('xbdachievements');
	var userContestEntries = db.collection('usercontestentries');

	userAchievements.count({
		userId: user._id,
		progressState: true,
		progression: {
			$gte: oneDay
		}
	}, function (err, userAchiCount) {
		if (err) {
			callback && callback();
			return;
		}
		if (!userAchiCount > 0) {
			userLeaderboards.update({
				userId: user._id
			}, {
				$set: {
					'dailyRank.value': 0,
					'dailyAchievementRank.value': 0
				}
			}, function (err) {
				callback();
			});
		} else {
			userAchievements.find({
				userId: user._id,
				progressState: true,
				progression: {
					$gte: oneDay
				}
			}, function (err, userAchis) {
				userAchis.forEach(function (userAchi, index, array) {
					xbdAchievements.findOne({
						_id: userAchi.achievementId
					}, function (err, doc) {
						userDailyGamerscore += doc.value;
						if (index === array.length - 1) {
							userLeaderboards.update({
								userId: user._id
							}, {
								$set: {
									'dailyRank.value': userDailyGamerscore,
									'dailyAchievementRank.value': userAchiCount
								}
							}, function (err) {
								callback();
							});
						}
					});
				});
			});
		}
	});
}

var weeklyCount = function (user, callback) {
	var userWeeklyGamerscore = 0,
		userLeaderboards = db.collection('userleaderboards'),
		oneWeek = moment.utc().startOf('isoWeek').toDate(),
		userAchievements = db.collection('userachievements'),
		userContestEntries = db.collection('usercontestentries'),
		xbdAchievements = db.collection('xbdachievements');
	userAchievements.count({
		userId: user._id,
		progressState: true,
		progression: {
			$gte: oneWeek
		}
	}, function (err, userAchiCount) {
		if (err) {
			callback && callback();
			return;
		}
		if (!userAchiCount > 0) {
			userLeaderboards.update({
				userId: user._id
			}, {
				$set: {
					'weeklyRank.value': 0,
					'weeklyAchievementRank.value': 0
				}
			}, function (err) {
				callback();
			});
		} else {
			userAchievements.find({
				userId: user._id,
				progressState: true,
				progression: {
					$gte: oneWeek
				}
			}, function (err, userAchis) {
				userAchis.forEach(function (userAchi, index, array) {
					xbdAchievements.findOne({
						_id: userAchi.achievementId
					}, function (err, doc) {
						userWeeklyGamerscore += doc.value;
						if (index === array.length - 1) {
							userLeaderboards.update({
								userId: user._id
							}, {
								$set: {
									'weeklyRank.value': userWeeklyGamerscore,
									'weeklyAchievementRank.value': userAchiCount
								}
							}, function (err) {
								callback();
							});
						}
					});
				});
			});
		}
	});
}

var monthlyCount = function (user, callback) {
	var userMonthlyGamerscore = 0,
		userLeaderboards = db.collection('userleaderboards'),
		oneMonth = moment.utc().startOf('month').toDate(),
		userContestEntries = db.collection('usercontestentries'),
		userAchievements = db.collection('userachievements'),
		xbdAchievements = db.collection('xbdachievements');
	userAchievements.count({
		userId: user._id,
		progressState: true,
		progression: {
			$gte: oneMonth
		}
	}, function (err, userAchiCount) {
		if (err) {
			callback && callback();
			return;
		}
		if (!userAchiCount > 0) {
			userLeaderboards.update({
				userId: user._id
			}, {
				$set: {
					'monthlyRank.value': 0,
					'monthlyAchievementRank.value': 0
				}
			}, function (err) {
				callback();
			});
		} else {
			userAchievements.find({
				userId: user._id,
				progressState: true,
				progression: {
					$gte: oneMonth
				}
			}, function (err, userAchis) {
				userAchis.forEach(function (userAchi, index, array) {
					xbdAchievements.findOne({
						_id: userAchi.achievementId
					}, function (err, doc) {
						userMonthlyGamerscore += doc.value;
						if (index === array.length - 1) {
							userLeaderboards.update({
								userId: user._id
							}, {
								$set: {
									'monthlyRank.value': userMonthlyGamerscore,
									'monthlyAchievementRank.value': userAchiCount
								}
							}, function (err) {
								callback();
							});
						}
					});
				});
			});
		}
	});
}

module.exports = {
	dailyCount: dailyCount,
	weeklyCount: weeklyCount,
	monthlyCount: monthlyCount 
}