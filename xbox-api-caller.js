const https = require('https');

var xboxApiCaller = function(url, callback) {
	var xbUrl = {
		host: 'xboxapi.com',
		path: '/v2/' + url,
		headers: {
			'X-AUTH': 'e9b6206816485c97bd0b0844073723988a848b3f'
		}
	};
	https.get(xbUrl, function (res) {
		var body = '';
		res.on('data', function(data) {
			body += data;
		});
		res.on('end', function() {
			if (res.statusCode !== 200 && res.statusCode !== 201) {
				console.log('we shouldnt be in here if status is 200');
				console.log('status is: ' + res.statusCode);
				var error = new Error("404", "Server is not responding.");
				callback(error, null);
				return;
			}
			var rateLimitRemaining = res.headers['x-ratelimit-remaining'];
			if (rateLimitRemaining > 0) {
				console.log("Calls Left: " + rateLimitRemaining);
				callback(null, JSON.parse(body));
			} else {
				var error = new Error("rateLimitExpired", "Rate limit has expired.");
				callback(error, null);
			}
		});
	}).on('error', function(error) {
		callback(error, null);
	});
};

// xboxApiCaller('2533274805933072/gamercard', function(err, res) {
// 	console.log(res);
// });

module.exports = xboxApiCaller;