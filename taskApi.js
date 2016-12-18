'use strict';

var fs = require('fs');
var https = require('https');
var API_HOST = 'api.github.com';
var POST_PATH = '/markdown/raw';
var TOKEN = '';
try {
    TOKEN = 'token ' + fs.readFileSync('token.txt', 'utf-8');
} catch (e) {
    console.info('token not found');
}

function sendRequest(url, params, callback) {
    var request = https.request(getOptions(url, params.method));
    request.on('response', function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            if (response.statusCode === 200 && params.method) {
                try {
                    callback(null, body);
                } catch (e) {
                    callback(e);
                }
            } else if (response.statusCode === 200 && !params.method) {
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
    request.end(params.write);
}

function getOptions(url, post) {
    var options = {};
    options.host = API_HOST;
    options.path = url;
    if (TOKEN) {
        options.headers = {
            'authorization': TOKEN,
            'User-Agent': 'zeaceApp'
        };
    }
    if (post) {
        options.method = 'POST';
        options.headers = {
            'authorization': TOKEN,
            'User-Agent': 'zeaceApp',
            'Content-Type': 'text/plain'
        };
    }

    return options;
}

exports.getRepos = function (org, callback) {
    var url = '/orgs/' + org + '/repos';
    sendRequest(url, { method: false, write: false }, callback);
};

exports.getRepoInfo = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task;
    sendRequest(url, { method: false, write: false }, callback);
};

exports.getReadMe = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task + '/readme';
    sendRequest(url, { method: false, write: false }, callback);
};

exports.getHTML = function (markdown, callback) {
    sendRequest(POST_PATH, { method: true, write: markdown }, callback);
};
