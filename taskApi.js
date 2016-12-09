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

function sendRequest(method, options, callback) {
    options.host = API_HOST;
    options.method = method;
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
            try {
                callback(null, JSON.parse(body));
            } catch (e) {
                callback(e);
            }
        });
    });
    request.on('error', callback);
    request.end();
}

exports.getRepos = function (org, callback) {
    var url = '/orgs/' + org + '/repos';
    sendRequest('GET', { path: url }, callback);
};

exports.getRepoInfo = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task;
    sendRequest('GET', { path: url }, callback);
};

exports.getReadMe = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task + '/readme';
    sendRequest('GET', { path: url }, callback);
};


