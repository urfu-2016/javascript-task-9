'use strict';

var fs = require('fs');
var path = require('path');
var flow = require('flow');
var request = require('./request');


var TOKEN_PATH = path.join(__dirname, '..', 'token.txt');
var AUTHORIZATION = '';

if (fs.existsSync(TOKEN_PATH)) {
    AUTHORIZATION = 'token ' + fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
}

var requestOptions = function (method, content, contentType) {
    var options = {
        method: method || 'GET',
        headers: {
            'User-Agent': 'GitHubAPI/1.1',
            'Content-Type': contentType || 'application/json'
        }
    };
    if (AUTHORIZATION) {
        options.headers.authorization = AUTHORIZATION;
    }
    if (content) {
        options.body = content;
    }

    return options;
};

var requestUrl = function () {
    return 'https://api.github.com/' + [].join.call(arguments, '/');
};

exports.getRepos = function (type, login, callback) {
    request.json(requestUrl(type, login, 'repos'), requestOptions(), callback);
};

exports.getRepo = function (login, repo, callback) {
    request.json(requestUrl('repos', login, repo), requestOptions(), callback);
};

exports.getReadme = function (login, repo, callback) {
    flow.serial([
        function (next) {
            var url = requestUrl('repos', login, repo, 'readme');
            request.json(url, requestOptions(), function (err, data) {
                if (err) {
                    next(err);
                } else {
                    data = new Buffer(data.content, data.encoding).toString('utf-8');
                    next(null, { markdown: data });
                }
            });
        },
        function (readme, next) {
            var options = requestOptions('POST', readme.markdown, 'text/x-markdown');
            request(requestUrl('markdown/raw'), options, function (err, data) {
                if (err) {
                    next(err);
                } else {
                    readme.html = data;
                    next(null, readme);
                }
            });
        }
    ], callback);
};
