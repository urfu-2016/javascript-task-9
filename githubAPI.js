'use strict';

var fs = require('fs');
var request = require('request');

var GITHUB_URL = 'https://api.github.com';
var LIST_METHOD = '/orgs/urfu-2016/repos';
var GET_REPO = '/repos/urfu-2016/';
var README_METHOD = '/readme';
var TOKEN_FILE_PATH = './token.txt';
var TOKEN;

try {
    TOKEN = fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
} catch (e) {
    TOKEN = '';
}

var REQUEST_DATA = {
    method: 'GET',
    headers: {
        'user-agent': 'node.js',
        Authorization: 'token ' + TOKEN
    }
};

exports.getListRequest = function (responseCallback) {
    REQUEST_DATA.url = GITHUB_URL + LIST_METHOD;
    request(REQUEST_DATA, responseCallback);
};

exports.repositoryRequest = function (task, responseCallback) {
    REQUEST_DATA.url = GITHUB_URL + GET_REPO + task;
    request(REQUEST_DATA, responseCallback);
};

exports.readmeRequest = function (task, responseCallback) {
    REQUEST_DATA.url = GITHUB_URL + GET_REPO + task + README_METHOD;
    request(REQUEST_DATA, responseCallback);
};

exports.readmeLoadFile = function (url, responseCallback) {
    request(url, responseCallback);
};
