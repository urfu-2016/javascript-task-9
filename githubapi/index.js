'use strict';

var flow = require('flow');
var fs = require('fs');
var url = require('url');
var request = require('./request');


var TOKEN_PATH = require('path').join(__dirname, '..', 'token.txt');
var AUTHORIZATION = '';

fs.readFile(TOKEN_PATH, 'utf-8', function (err, token) {
    if (!err) {
        AUTHORIZATION = 'token ' + token.trim();
    }
});

url.join = function () {
    return [].reduce.call(arguments, function (path, item) {
        return path + '/' + item;
    }, '');
};

var requestOptions = function (path, method, headers) {
    var options = url.parse(url.resolve('https://api.github.com', path));
    options.method = method || 'GET';
    options.headers = headers || {};
    options.headers['User-Agent'] = 'GitHubAPI/1.1';
    if (AUTHORIZATION) {
        options.headers.authorization = AUTHORIZATION;
    }

    return options;
};

exports.getRepos = function (type, login, callback) {
    request.json(requestOptions(url.join(type, login, 'repos')), null, callback);
};

exports.getRepo = function (login, repo, callback) {
    request.json(requestOptions(url.join('repos', login, repo)), null, callback);
};

exports.getReadme = function (login, repo, callback) {
    flow.serial([
        function (next) {
            var params = requestOptions(url.join('repos', login, repo, 'readme'));
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
