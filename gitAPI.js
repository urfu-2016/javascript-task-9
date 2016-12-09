'use strict';

var request = require('request');
var fs = require('fs');

var token = '';

try {
    token = '?access_token=' + fs.readFileSync('token.txt', 'utf-8');
} catch (error) {
    console.info('no such file "token.txt"');
}

var githubAPI = 'https://api.github.com';

var GET_ALL_REPOSITORY = {
    url: githubAPI + '/orgs/urfu-2016/repos' + token,
    headers: {
        'User-Agent': 'request'
    }
};

var GET_TASK_INFO = {
    url: githubAPI + '/repos/urfu-2016/',
    headers: {
        'User-Agent': 'request'
    }
};

var GET_README = {
    url: githubAPI + '/repos/urfu-2016/',
    headers: {
        'User-Agent': 'request'
    }
};

exports.getAllRepository = function (callback) {
    request(GET_ALL_REPOSITORY, callback);
};

exports.getTaskInfo = function (task, callback) {
    var url = GET_TASK_INFO.url;
    GET_TASK_INFO.url = GET_TASK_INFO.url + task + token;
    request(GET_TASK_INFO, callback);
    GET_TASK_INFO.url = url;
};

exports.getReadme = function (task, callback) {
    var url = GET_README.url;
    GET_README.url = GET_README.url + task + '/readme' + token;
    request(GET_README, callback);
    GET_README.url = url;
};

