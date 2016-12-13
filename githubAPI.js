'use strict';

var https = require('https');
var fs = require('fs');
var TOKEN;
var ORG_REPOS = '/orgs/urfu-2016/repos';
var REPOS = '/repos/urfu-2016/';

try {
    TOKEN = 'token ' + fs.readFileSync('./token.txt', 'utf-8');
} catch (exception) {
    console.error('File with token not found');
    TOKEN = 'token ';
}
var OPTIONS = {
    host: 'api.github.com',
    headers: {
        'user-agent': 'node.js',
        'Authorization': TOKEN
    }
};

function makeRequest(callback, copyOptions) {
    https
        .request(copyOptions, function (rCallback, response) {
            var buffer = new Buffer('', 'utf8');
            response.on('error', rCallback);
            response.on('data', function (chunk) {
                buffer = Buffer.concat([buffer, chunk]);
            });
            response.on('end', function () {
                rCallback(null, buffer.toString('utf8'));
            });
        }.bind(null, callback))
        .end();
}

exports.getList = function (callback) {
    var copy = Object.assign({}, OPTIONS);
    copy.path = ORG_REPOS;
    makeRequest(callback, copy);
};

exports.getRepository = function (task, callback) {
    var copy = Object.assign({}, OPTIONS);
    copy.path = REPOS + task;
    makeRequest(callback, copy);
};

exports.getReadMe = function (task, callback) {
    var copy = Object.assign({}, OPTIONS);
    copy.path = REPOS + task + '/readme';
    makeRequest(callback, copy);
};

exports.downloadReadMe = function (url, callback) {
    https
        .request(url, function (response) {
            var buffer = new Buffer('', 'utf8');
            response.on('error', callback);
            response.on('data', function (chunk) {
                buffer = Buffer.concat([buffer, chunk]);
            });
            response.on('end', function () {
                callback(null, buffer.toString('utf8'));
            });
        })
        .end();
};

