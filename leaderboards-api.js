// var mongoJS = require('mongojs');
// var meteorUrl = 'mongodb://127.0.0.1:3001/meteor';
// var xboxApiCaller = require('./xbox-api-caller.js');
// var async = require('async');

// var db = mongoJS(meteorUrl);

// var leaderboardsApi = leaderboardsApi || {};

// leaderboardsApi.buildUserRanks = function(userId, callback) {
// 	if (typeof userId !== 'string') {
// 		console.log('callback on line ')
// 	}

// 	var users = db.collection('users');

// 	users.findOne({ _id: userId }, function(err, users) {
// 		if (err) {
			
// 		}
// 	});

// 	if (!user) return;
// 	if (user) {
// 		if (user.gamertagScanned.status === 'false' || user.gamertagScanned.status === 'building') {
// 			return;
// 		}
// 	}

// 	var checkUserForLeaderboard = userLeaderboards.find({userId: userId});
// 	if (checkUserForLeaderboard.count() > 0) return;

// 	var userStats = {
// 		userId: userId,
// 		overallRank: 0,
// 		dailyRank: { value: 0, rank: 0 },
// 		completedGames: { count: 0, rank: 0 },
// 		completedAchievements: { count: 0, rank: 0 },
// 		totalAchievements: { count: 0, rank: 0 },
// 		commonAchievements: { count: 0, rank: 0 },
// 		rareAchievements: { count: 0, rank: 0 },
// 		epicAchievements: { count: 0, rank: 0 },
// 		legendaryAchievements: { count: 0, rank: 0 }
// 	};

// 	userLeaderboards.insert(userStats);
// }

// leaderboardsApi.updateUserCounts = function(userId) {
// 	check(userId, String);

// 	var userStat = userLeaderboards.find({userId: userId});
// 	if (!userStat || !userStat.count() || userStat.count() === 0) return;

// 	this.countUserDailyGamerscore(userId);
// 	this.countUserCompletedGames(userId);
// 	this.countCompletedAchievements(userId);
// 	this.countTotalAchievements(userId);
// 	this.countCommonAchievements(userId);
// 	this.countRareAchievements(userId);
// 	this.countEpicAchievements(userId);
// 	this.countLegendaryAchievements(userId);

// 	var date = moment().format();

// 	userLeaderboards.update({ userId: userId }, { $set: { updated: date } });
// }

// leaderboardsApi.updateUserRanks = function() {
// 	this.updateOverallRank();
// 	this.dailyRank();
// 	this.updateUserCompletedGamesRank();
// 	this.updateCompletedAchievementsRank();
// 	this.updateTotalAchievementsRank();
// 	this.updateCommonAchievementsRank();
// 	this.updateRareAchievementsRank();
// 	this.updateEpicAchievementsRank();
// 	this.updateLegendaryAchievementsRank();
// }

// leaderboardsApi.updateOverallRank = function() {
// 	var userOverallRank = 1;
// 	var users = Meteor.users.find({ "gamercard.gamerscore": { $gt: 1 } }, { sort: { "gamercard.gamerscore": -1 } });
// 	if (!users) return;
// 	users.forEach(function(user) {
// 		userLeaderboards.update({ userId: user._id }, { $set: { 'overallRank': userOverallRank } });
// 		userOverallRank++;
// 	});
// }

// leaderboardsApi.countUserDailyGamerscore = function(userId) {
// 	var userDailyGamerscore = 0;
// 	var userStat = userLeaderboards.find({ userId: userId });
// 	var oneDay = moment().startOf('day').toDate();
// 	if (!userStat || !userStat.count() || !userStat.count() > 0) return;

// 	var userDailyAchievements = userAchievements.find({ userId: userId, progressState: true, progression: { $gte: oneDay } });
// 	//find each users gamerscore for the past 24 hours and put it into a field called userDailyGamerscore
// 	if (!userDailyAchievements || !userDailyAchievements.count() || !userDailyAchievements.count() > 0) {
// 		userLeaderboards.update({ userId: userId }, { $set: { 'dailyRank.value': userDailyGamerscore } });
// 		return;
// 	}

// 	userDailyAchievements.forEach(function(achievement) {
// 		var singleAchievementValue = xbdAchievements.findOne({ _id: achievement.achievementId }).value;
// 		userDailyGamerscore += singleAchievementValue;
// 	});
// 	userLeaderboards.update({ userId: userId }, { $set: { 'dailyRank.value': userDailyGamerscore } });
// }

// leaderboardsApi.dailyRank = function() {
// 	//find each user and assign them a daily rank based upon the above computed userDailyGamerscore
// 	var userDailyRank = 1;
// 	var userStats = userLeaderboards.find({ 'dailyRank.value': { $gt: 1 } }, { $sort: { 'dailyRank.value': -1 } });
	
// 	userStats.forEach(function(userStat){
// 		userLeaderboards.update({ userId: userStat.userId }, { $set: { 'dailyRank.rank': userDailyRank } });
// 		userDailyRank++;
// 	});
// }

// leaderboardsApi.countUserCompletedGames = function(userId) {
// 	check(userId, String);
// 	var completedGames = userGames.find({ userId: userId, completed: true });
// 	var count = completedGames ? completedGames.count() : 0;
// 	userLeaderboards.update({ userId: userId }, { $set: { 'completedGames.count': count } });
// }

// leaderboardsApi.updateUserCompletedGamesRank = function() {
// 	var rank = 1;
// 	var userStats = userLeaderboards.find({'completedGames.count': { $gte: 1 } }, { sort: { 'completedGames.count': -1 } });
// 	if (!userStats || !userStats.count() || !userStats.count() > 0) return;
// 	userStats.forEach(function(userStat) {
// 		userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedGames.rank': rank } });
// 		rank++;
// 	});
// }

// leaderboardsApi.countCompletedAchievements = function(userId) {
// 	check(userId, String);
// 	var completedAchievements = userAchievements.find({ userId: userId, progressState: true });
// 	var count = completedAchievements ? completedAchievements.count() : 0;
// 	userLeaderboards.update({ userId: userId }, { $set: { 'completedAchievements.count': count } });
// }

// leaderboardsApi.updateCompletedAchievementsRank = function() {
// 	var rank = 1;
// 	var userStats = userLeaderboards.find({ 'completedAchievements.count': { $gte: 1 } }, { sort: { 'completedAchievements.count': -1 } });
// 	if (!userStats || !userStats.count() || !userStats.count() > 0) return;
// 	userStats.forEach(function(userStat) {
// 		userLeaderboards.update({ userId: userStat.userId }, { $set: { 'completedAchievements.rank': rank } });
// 		rank++;
// 	});
// }

// leaderboardsApi.countTotalAchievements = function(userId) {
// 	check(userId, String);
// 	var totalAchievements = userAchievements.find({ userId: userId });
// 	var count = totalAchievements ? totalAchievements.count() : 0;
// 	userLeaderboards.update({ userId: userId }, { $set: { 'totalAchievements.count': count } });
// }

// leaderboardsApi.updateTotalAchievementsRank = function() {
// 	var rank = 1;
// 	var userStats = userLeaderboards.find({ 'totalAchievements.count': { $gte: 1 } }, { sort: { 'totalAchievements.count': -1 } });
// 	if (!userStats || !userStats.count() || !userStats.count() > 0) return;
// 	userStats.forEach(function(userStat) {
// 		userLeaderboards.update({ userId: userStat.userId }, { $set: { 'totalAchievements.rank': rank } });
// 		rank++;
// 	});
// }

// leaderboardsApi.countCommonAchievements = function(userId) {
// 	check(userId, String);
// 	var commonCount = 0;
// 	var userAchievement = userAchievements.find({ userId: userId, progressState: true });
// 	if (!userAchievement) return;
// 	userAchievement.forEach(function(a) {
// 		var achievement = xbdAchievements.findOne({ _id: a.achievementId });
// 		var userPercentage = achievement.userPercentage;
// 		if (userPercentage && userPercentage >= 61) {
// 			commonCount++;
// 		}
// 	});
// 	userLeaderboards.update({ userId: userId }, { $set: { 'commonAchievements.count': commonCount } });
// }

// leaderboardsApi.updateCommonAchievementsRank = function() {
// 	var rank = 1;
// 	var userStats = userLeaderboards.find({'commonAchievements.count': { $gte: 1 }}, { sort: { 'commonAchievements.count': -1 } });
// 	if (!userStats || !userStats.count() || !userStats.count() > 0) return;
// 	userStats.forEach(function(userStat) {
// 		userLeaderboards.update({ userId: userStat.userId }, { $set: { 'commonAchievements.rank': rank } });
// 		rank++;
// 	});
// }

// leaderboardsApi.countRareAchievements = function(userId) {
// 	check(userId, String);
// 	var rareCount = 0;
// 	var userAchievement = userAchievements.find({ userId: userId, progressState: true });
// 	if (!userAchievement) return;
// 	userAchievement.forEach(function(a) {
// 		var achievement = xbdAchievements.findOne({ _id: a.achievementId });
// 		var userPercentage = achievement.userPercentage;
// 		if (userPercentage && (userPercentage >= 31 && userPercentage <= 60)) {
// 			rareCount++;
// 		}
// 	});
// 	userLeaderboards.update({ userId: userId }, { $set: { 'rareAchievements.count': rareCount } });
// }

// leaderboardsApi.updateRareAchievementsRank = function() {
// 	var rank = 1;
// 	var userStats = userLeaderboards.find({'rareAchievements.count': { $gte: 1 } }, { sort: { 'rareAchievements.count': -1 } });
// 	if (!userStats || !userStats.count() || !userStats.count() > 0) return;
// 	userStats.forEach(function(userStat) {
// 		userLeaderboards.update({ userId: userStat.userId }, { $set: { 'rareAchievements.rank': rank } });
// 		rank++;
// 	});
// }

// leaderboardsApi.countEpicAchievements = function(userId) {
// 	check(userId, String);
// 	var epicCount = 0;
// 	var userAchievement = userAchievements.find({ userId: userId, progressState: true });
// 	if (!userAchievement) return;
// 	userAchievement.forEach(function(a) {
// 		var achievement = xbdAchievements.findOne({ _id: a.achievementId });
// 		var userPercentage = achievement.userPercentage;
// 		if (userPercentage && (userPercentage >= 11 && userPercentage <= 30)) {
// 			epicCount++;
// 		}
// 	});
// 	userLeaderboards.update({ userId: userId }, { $set: { 'epicAchievements.count': epicCount } });
// }

// leaderboardsApi.updateEpicAchievementsRank = function() {
// 	var rank = 1;
// 	var userStats = userLeaderboards.find({'epicAchievements.count': { $gte: 1 } }, { sort: { 'epicAchievements.count': -1 } });
// 	if (!userStats || !userStats.count() || !userStats.count() > 0) return;
// 	userStats.forEach(function(userStat) {
// 		userLeaderboards.update({ userId: userStat.userId }, { $set: { 'epicAchievements.rank': rank } });
// 		rank++;
// 	});
// }

// leaderboardsApi.countLegendaryAchievements = function(userId) {
// 	check(userId, String);
// 	var legendaryCount = 0;
// 	var userAchievement = userAchievements.find({ userId: userId, progressState: true });
// 	if (!userAchievement) return;
// 	userAchievement.forEach(function(a) {
// 		var achievement = xbdAchievements.findOne({ _id: a.achievementId });
// 		var userPercentage = achievement.userPercentage;
// 		if (userPercentage && (userPercentage >= 0 && userPercentage <= 10)) {
// 			legendaryCount++;
// 		}
// 	});
// 	userLeaderboards.update({ userId: userId }, { $set: { 'legendaryAchievements.count': legendaryCount } });
// }

// leaderboardsApi.updateLegendaryAchievementsRank = function() {
// 	var rank = 1;
// 	var userStats = userLeaderboards.find({'legendaryAchievements.count': { $gte: 1 } }, { sort: { 'legendaryAchievements.count': -1 } });
// 	if (!userStats || !userStats.count() || !userStats.count() > 0) return;
// 	userStats.forEach(function(userStat) {
// 		userLeaderboards.update({ userId: userStat.userId }, { $set: { 'legendaryAchievements.rank': rank } });
// 		rank++;
// 	});
// }