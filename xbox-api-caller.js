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
				console.log('the end point we want to hit is: ' + url);
				callback({ reason: 'the api did not respond OK 200', data: { head: res.headers, statusMessage: res.statusMessage } }, null);
				return;
			}
			var rateLimitRemaining = res.headers['x-ratelimit-remaining'];
			if (rateLimitRemaining > 0) {
				console.log("Calls Left: " + rateLimitRemaining);
				callback(null, JSON.parse(body));
			} else {
				callback({reason: 'we are out of API calls', data: res}, null);
			}
		});
	}).on('error', function(error) {
		callback({reason: 'there is an error with the api', data: error}, null);
	});
};

module.exports = xboxApiCaller;