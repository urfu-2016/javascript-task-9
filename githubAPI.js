'use strict';

var https = require('https');
var fs = require('fs');
var token;

try {
    token = 'token ' + fs.readFileSync('./token.txt', 'utf-8');
} catch (exception) {
    token = 'token ';
}
var options = {
    host: 'api.github.com',
    method: 'GET',
    headers: {
        'user-agent': 'node.js',
        'Authorization': token
    }
};

function makeRequest(callback, url) {
    https
        .request(options, function (rCallback, response) {
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
    options.path = '/orgs/urfu-2016/repos';
    makeRequest(callback);
};

exports.getRepository = function (task, callback) {
    options.path = '/repos/urfu-2016/' + task;
    makeRequest(callback);
};

exports.getReadMe = function (task, callback) {
    options.path = '/repos/urfu-2016/' + task + '/readme';
    makeRequest(callback);
};

exports.downloadReadMe = function (url, callback) {
    https
        .request(url, function (rCallback, response) {
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
};

