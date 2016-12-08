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

var requestOptions = function (urlPath, method, headers) {
    headers = headers || {};
    headers['User-Agent'] = 'GitHubAPI/1.1';
    if (AUTHORIZATION) {
        headers.authorization = AUTHORIZATION;
    }

    return request.create('https://api.github.com/' + urlPath, method, headers);
};

exports.getRepos = function (type, login, callback) {
    request.json(requestOptions([type, login, 'repos'].join('/')), null, callback);
};

exports.getRepo = function (login, repo, callback) {
    request.json(requestOptions(['repos', login, repo].join('/')), null, callback);
};

exports.getReadme = function (login, repo, callback) {
    flow.serial([
        function (next) {
            var options = requestOptions(['repos', login, repo, 'readme'].join('/'));
            request.json(options, null, function (err, data) {
                if (err) {
                    next(err);
                } else {
                    data = new Buffer(data.content, data.encoding).toString('utf-8');
                    next(null, { markdown: data });
                }
            });
        },
        function (readme, next) {
            var params = requestOptions('markdown/raw', 'POST', {
                'Content-Type': 'text/x-markdown'
            });
            request(params, readme.markdown, function (err, data) {
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
