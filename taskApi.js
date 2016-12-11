'use strict';

var fs = require('fs');
var https = require('https');
var API_HOST = 'api.github.com';
var TOKEN = '';
try {
    TOKEN = 'token ' + fs.readFileSync('token.txt', 'utf-8');
} catch (e) {
    console.info('token not found');
}

function sendRequest(url, callback) {
    var request = https.request(getOptions(url));
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

function getOptions(url) {
    var options = {};
    options.host = API_HOST;
    options.path = url;
    if (TOKEN) {
        options.headers = {
            'authorization': TOKEN,
            'User-Agent': 'zeaceApp'
        };
    }

    return options;
}

exports.getRepos = function (org, callback) {
    var url = '/orgs/' + org + '/repos';
    sendRequest(url, callback);
};

exports.getRepoInfo = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task;
    sendRequest(url, callback);
};

exports.getReadMe = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task + '/readme';
    sendRequest(url, callback);
};


