'use strict';

var https = require('https');
var fs = require('fs');

var token = '';

try {
    token = '?access_token=' + fs.readFileSync('token.txt', 'utf-8');
} catch (error) {
    console.info('no such file "token.txt"');
}

var githubAPI = 'api.github.com';

var GET_ALL_REPOSITORY = {
    method: 'GET',
    protocol: 'https:',
    host: githubAPI,
    path: '/orgs/urfu-2016/repos' + token,
    headers: {
        'User-Agent': 'request'
    }
};

var GET_TASK_INFO = {
    method: 'GET',
    protocol: 'https:',
    host: githubAPI,
    path: '/repos/urfu-2016/',
    headers: {
        'User-Agent': 'request'
    }
};

var GET_README = {
    method: 'GET',
    protocol: 'https:',
    host: githubAPI,
    path: '/repos/urfu-2016/',
    headers: {
        'User-Agent': 'request'
    }
};

var request = function (query, cb) {
    var req = https.request(query);
    var body = '';
    var error = null;
    req.on('error', function (err) {
        cb(err);
    });
    req.end();
    req.on('response', function (response) {
        response.on('data', function (chunk) {
            body += chunk; // res.write(chunk);
        });

        response.on('end', function () {
            cb(error, response, body);
        });
    });
    req.end();
};

exports.getAllRepository = function (callback) {
    request(GET_ALL_REPOSITORY, callback);
};

exports.getTaskInfo = function (task, callback) {
    var url = GET_TASK_INFO.path;
    GET_TASK_INFO.path = GET_TASK_INFO.path + task + token;
    request(GET_TASK_INFO, callback);
    GET_TASK_INFO.path = url;
};

exports.getReadme = function (task, callback) {
    var url = GET_README.path;
    GET_README.path = GET_README.path + task + '/readme' + token;
    request(GET_README, callback);
    GET_README.path = url;
};
