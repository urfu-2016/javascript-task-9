'use strict';

var fs = require('fs');
var https = require('https');

var GITHUB_API_HOST = 'api.github.com';
var PATH_TO_REPO = '/urfu-2016/';
var PATH_TO_TOKEN = 'token.txt';
var USER_AGENT = 'My-Awesome-github-api';

var TOKEN = fs.existsSync(PATH_TO_TOKEN) ? fs.readFileSync(PATH_TO_TOKEN) : '';

function buildOptions(apiMethod, apiParam) {
    return {
        protocol: 'https:',
        host: GITHUB_API_HOST,
        path: '/' + apiMethod + PATH_TO_REPO + apiParam + (TOKEN ? ('?access_token=' + TOKEN) : ''),
        headers: { 'User-Agent': USER_AGENT }
    };
}

function getSubscriberToReadData(callback) {
    return function (request) {
        var errorHappend = false;
        var data = '';

        request.on('error', function (error) {
            errorHappend = true;
            callback(error);
        });

        request.on('data', function (chunk) {
            data += chunk;
        });

        request.on('end', function () {
            if (!errorHappend) {
                callback(null, data);
            }
        });
    };
}

function makeJsonCallback(callback) {
    return function (error, result) {
        if (error) {
            callback(error);
        } else {
            try {
                callback(null, JSON.parse(result));
            } catch (e) {
                callback(e);
            }
        }
    };
}

exports.getRepoInfo = function (repo, callback) {
    var request = https.request(buildOptions('repos', repo),
        getSubscriberToReadData(makeJsonCallback(callback)));
    request.end();
};

exports.getRepoReadme = function (repo, callback) {
    var request = https.request(buildOptions('repos', repo + '/readme'),
        getSubscriberToReadData(function (error, result) {
            if (error) {
                callback(error);

                return;
            }
            var readmeInfo = JSON.parse(result);
            callback(null, new Buffer(readmeInfo.content, readmeInfo.encoding).toString('utf-8'));
        }));
    request.end();
};

exports.getRepoList = function (callback) {
    var request = https.request(buildOptions('orgs', 'repos'),
        getSubscriberToReadData(makeJsonCallback(callback)));
    request.end();
};

exports.parseMarkdown = function (markdown, callback) {
    var request = https.request({
        protocol: 'https:',
        host: GITHUB_API_HOST,
        path: '/markdown/raw',
        method: 'POST',
        headers: {
            'Content-Type': 'text/x-markdown',
            'User-Agent': USER_AGENT
        }
    }, getSubscriberToReadData(callback));
    request.write(markdown);
    request.end();
};
