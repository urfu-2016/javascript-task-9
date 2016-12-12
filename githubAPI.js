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

exports.getList = function (responseCallback) {
    makeRequest(getRequestData(LIST_METHOD), requestCallback.bind(null, responseCallback));
};

exports.getRepository = function (task, responseCallback) {
    var path = GET_REPO_METHOD + task;
    makeRequest(getRequestData(path), requestCallback.bind(null, responseCallback));
};

exports.getReadmeInfo = function (task, responseCallback) {
    var path = GET_REPO_METHOD + task + README_METHOD;
    makeRequest(getRequestData(path), requestCallback.bind(null, responseCallback));
};

exports.getReadmeFile = function (url, responseCallback) {
    makeRequest(url, requestCallback.bind(null, responseCallback));
};

function getRequestData(path) {
    return {
        host: GITHUB_URL,
        path: path,
        method: 'GET',
        headers: {
            'user-agent': 'node.js',
            Authorization: 'token ' + TOKEN
        }
    };
}

function makeRequest(requestData, callback) {
    https
        .request(requestData, callback)
        .end();
}

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
        callback(null, responseData.toString());
    });
}
