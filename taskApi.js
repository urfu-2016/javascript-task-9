'use strict';

var fs = require('fs');
var https = require('https');
var API_HOST = 'api.github.com';
var TOKEN;
try {
    TOKEN = 'token ' + fs.readFileSync('token.txt', 'utf-8');
} catch (e) {
    TOKEN = '';
}

function sendRequest(options, callback) {
    options.host = API_HOST;
    options.method = 'GET';
    if (TOKEN) {
        options.headers = {
            'authorization': TOKEN,
            'User-Agent': 'zeaceApp'
        };
    }
    var request = https.request(options);
    request.on('response', function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            if (response.statusCode === 200) {
                try {
                    callback(null, JSON.parse(body));
                } catch (e) {
                    callback(e);
                }
            } else {
                callback(new Error(response.statusCode + response.statusMessage));
            }
        });
    });
    request.on('error', callback);
    request.end();
}

exports.getRepos = function (org, callback) {
    var url = '/orgs/' + org + '/repos';
    sendRequest({ path: url }, callback);
};

exports.getRepoInfo = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task;
    sendRequest({ path: url }, callback);
};

exports.getReadMe = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task + '/readme';
    sendRequest({ path: url }, callback);
};


