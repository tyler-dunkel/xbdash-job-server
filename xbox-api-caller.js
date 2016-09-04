const https = require('https');

var xboxApiCaller = function(url, callback) {
	var xbUrl = {
		host: 'xboxapi.com',
		path: '/v2/' + url,
		headers: {
			'X-AUTH': 'e9b6206816485c97bd0b0844073723988a848b3f'
		}
	};
	console.log('this url has been tried: ' + arguments[2] + ' times: ' + url);
	var retries = typeof arguments[2] === 'number' ? arguments[2] + 1 : 0;
	https.get(xbUrl, function (res) {
		var body = '';
		res.on('data', function(data) {
			body += data;
		});
		res.on('end', function() {
			if (res.statusCode !== 200 && res.statusCode !== 201) {
				console.log('we shouldnt be in here if status is 200');
				console.log('status is: ' + res.statusCode);
				if (res.statusCode === 503) {
					if (retries > 5) {
						callback({reason: 'the api must be down, over 5 retries with a 503', data: { head: res.headers } }, null);
						return;
					}
					console.log('503 status, retrying the function, retries under 5: ' + retries);
					setTimeout(function() {
						console.log('called after 1 second wait');
						xboxApiCaller(url, callback, retries);
					}, 10000);
					return;
				}
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