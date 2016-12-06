'use strict';

var https = require('https');
var flow = require('flow.gallyam');
var fs = require('fs');

var API_URL = 'api.github.com';
var BASE_PATH = '/users/urfu-2016/repos';

function GitHubClient(token) {
    this.token = token;
}

exports.getRepos = function (category) {
    flow.serial([
            fs.readFile.bind(null, 'token.txt'),
        ])
    var options = {
        hostname: API_URL,
        port: 443,
        path: BASE_PATH,
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + new Buffer(':').toString('base64'),
            'User-Agent': 'Gallyam repo browser'
        }
    };

    var req = https.request(options,
        function (res) {
            console.log(res.statusCode);
            var content = '';
            res.on('data', function (chunk) {
                content += chunk;
            });
            res.on('end', function () {
                console.log('Content: ' + content);
            });
        }).on('error', function (err) {
            console.log('Error: ' + err);
        });

    req.end();
}
