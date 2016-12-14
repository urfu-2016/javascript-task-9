'use strict';

var https = require('https');
var fs = require('fs');
var flow = require('flow');

var API_GITHUB = 'api.github.com';
var API_TOKEN = getToken();
var ASYNS_JSON_PARSE = flow.makeAsync(JSON.parse);

function getToken() {
    try {
        return fs.readFileSync('token.txt', 'utf-8');
    } catch (e) {
        console.error(e);
    }
}

function sendRequest(method, url, body, callback) {
    var options = {
        method: method,
        host: API_GITHUB,
        path: url,
        headers: {
            'User-Agent': 'api-agent'
        }
    };

    if (API_TOKEN) {
        options.headers.Authorization = 'token ' + API_TOKEN;
    }

    if (method === 'POST') {
        options.headers['Content-Type'] = 'text/plain';
    }

    var cb = function (response) {
        var data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('error', callback);
        response.on('end', function () {
            if (response.statusCode === 200) {
                callback(null, data);
            } else {
                callback(new Error('No connect'));
            }
        });
    };

    https.request(options, cb).end(body);
}

function getJsonAsyns(url, callback) {
    flow.serial([
        sendRequest.bind(null, 'GET', url, null),
        ASYNS_JSON_PARSE
    ], callback);
}

exports.getReposAsync = function (user, callback) {
    getJsonAsyns('/orgs/' + user + '/repos', callback);
};

exports.getRepoAsync = function (user, repo, callback) {
    getJsonAsyns('/repos/' + user + '/' + repo, callback);
};

exports.getReadmeAsync = function (user, repo, callback) {
    getJsonAsyns('/repos/' + user + '/' + repo + '/readme', callback);
};

exports.readmeToHtml = function (readme, callback) {
    sendRequest('POST', '/markdown/raw', readme, callback);
};
