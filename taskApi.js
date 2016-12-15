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

function sendRequest(url, post, markdown, callback) {
    var request = https.request(getOptions(url, post));
    request.on('response', function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            if (response.statusCode === 200 && post) {
                try {
                    callback(null, body);
                } catch (e) {
                    callback(e);
                }
            } else if (response.statusCode === 200 && !post) {
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
    request.end(markdown);
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
        options.headers['Content-Type'] = 'text/plain';
    }

    return options;
}

exports.getRepos = function (org, callback) {
    var url = '/orgs/' + org + '/repos';
    sendRequest(url, false, false, callback);
};

exports.getRepoInfo = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task;
    sendRequest(url, false, false, callback);
};

exports.getReadMe = function (task, org, callback) {
    var url = '/repos/' + org + '/' + task + '/readme';
    sendRequest(url, false, false, callback);
};

exports.getHTML = function (markdown, org, callback) {
    sendRequest(POST_PATH, true, markdown, callback);
};
