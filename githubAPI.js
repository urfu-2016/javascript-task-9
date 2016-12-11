'use strict';

var fs = require('fs');
var https = require('https');

var GITHUB_URL = 'api.github.com';
var LIST_METHOD = '/orgs/urfu-2016/repos';
var GET_REPO_METHOD = '/repos/urfu-2016/';
var README_METHOD = '/readme';
var MARKDOWN_HTML_METHOD = '/markdown/raw';
var TOKEN_FILE_PATH = './token.txt';
var TOKEN;

try {
    TOKEN = fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
} catch (e) {
    console.error('token.txt wasn\'t found');

    TOKEN = '';
}

var REQUEST_DATA = {
    host: GITHUB_URL,
    method: 'GET',
    headers: {
        'user-agent': 'node.js',
        Authorization: 'token ' + TOKEN
    }
};

exports.getList = function (responseCallback) {
    REQUEST_DATA.path = LIST_METHOD;
    https
        .request(REQUEST_DATA, requestCallback.bind(null, responseCallback))
        .end();
};

exports.getRepository = function (task, responseCallback) {
    REQUEST_DATA.path = GET_REPO_METHOD + task;
    https
        .request(REQUEST_DATA, requestCallback.bind(null, responseCallback))
        .end();
};

exports.getReadmeInfo = function (task, responseCallback) {
    REQUEST_DATA.path = GET_REPO_METHOD + task + README_METHOD;
    https
        .request(REQUEST_DATA, requestCallback.bind(null, responseCallback))
        .end();
};

exports.getReadmeFile = function (url, responseCallback) {
    https
        .request(url, requestCallback.bind(null, responseCallback))
        .end();
};

exports.getReadmeHtml = function (text, responseCallback) {
    var req = https
        .request({
            path: MARKDOWN_HTML_METHOD,
            host: GITHUB_URL,
            method: 'POST',
            encoding: 'utf8',
            headers: {
                'user-agent': 'node.js',
                'Content-Type': 'text/plain'
            }
        }, requestCallback.bind(null, responseCallback));

    req.write(text);
    req.end();
};

function requestCallback(callback, response) {
    var responseData = new Buffer('', 'utf8');

    response.on('error', callback);

    response.on('data', function (chunk) {
        responseData = Buffer.concat([responseData, chunk]);
    });

    response.on('end', function () {
        callback(null, responseData.toString('utf8'));
    });
}
