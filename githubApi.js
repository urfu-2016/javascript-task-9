'use strict';

var fs = require('fs');
var https = require('https');

var GITHUB_API_HOST = 'api.github.com';
var PATH_TO_REPO = '/urfu-2016/';
var PATH_TO_TOKEN = 'token.txt';
var USER_AGENT = 'My-Awesome-github-api';

var TOKEN;
try {
    TOKEN = fs.readFileSync(PATH_TO_TOKEN);
} catch (e) {
    TOKEN = '';
}

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
        var data = '';

        request.on('error', callback);

        request.on('data', function (chunk) {
            data += chunk;
        });

        request.on('end', function () {
            callback(null, data);
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

function makeHttpRequest(apiMethod, apiParam, callback) {
    var request = https.request(buildOptions(apiMethod, apiParam),
        getSubscriberToReadData(callback));
    request.end();
}

exports.getRepoInfo = function (repo, callback) {
    makeHttpRequest('repos', repo, makeJsonCallback(callback));
};

exports.getRepoReadme = function (repo, callback) {
    makeHttpRequest('repos', repo + '/readme', function (error, result) {
        if (error) {
            callback(error);

            return;
        }
        try {
            var readmeInfo = JSON.parse(result);
            callback(null, new Buffer(readmeInfo.content, readmeInfo.encoding)
                .toString('utf-8'));
        } catch (e) {
            callback(e);
        }
    });
};

exports.getRepoList = function (callback) {
    makeHttpRequest('orgs', 'repos', makeJsonCallback(callback));
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
