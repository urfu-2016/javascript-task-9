'use strict';

var flow = require('flow');
var fs = require('fs');
var path = require('path');
var request = require('./request');


var TOKEN_PATH = path.join(__dirname, '..', 'token.txt');
var AUTHORIZATION = '';

if (fs.existsSync(TOKEN_PATH)) {
    AUTHORIZATION = 'token ' + fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
}

var urlPathJoin = function () {
    return [].reduce.call(arguments, function (urlPath, item) {
        return urlPath + '/' + item;
    }, '');
};

var requestOptions = function (urlPath, method, headers) {
    headers = headers || {};
    headers['User-Agent'] = 'GitHubAPI/1.1';
    if (AUTHORIZATION) {
        headers.authorization = AUTHORIZATION;
    }

    return request.create('https://api.github.com' + urlPath, method, headers);
};

exports.getRepos = function (type, login, callback) {
    request.json(requestOptions(urlPathJoin(type, login, 'repos')), null, callback);
};

exports.getRepo = function (login, repo, callback) {
    request.json(requestOptions(urlPathJoin('repos', login, repo)), null, callback);
};

exports.getReadme = function (login, repo, callback) {
    flow.serial([
        function (next) {
            var params = requestOptions(urlPathJoin('repos', login, repo, 'readme'));
            request.json(params, null, function (err, data) {
                if (err) {
                    next(err);
                } else {
                    data = new Buffer(data.content, data.encoding).toString('utf-8');
                    next(null, { markdown: data });
                }
            });
        },
        function (readme, next) {
            var params = requestOptions('/markdown/raw', 'POST', {
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
