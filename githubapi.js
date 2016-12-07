'use strict';

var flow = require('flow');
var fs = require('fs');
var https = require('https');


var TOKEN_PATH = require('path').join(__dirname, 'token.txt');

var requestHandler = function (req, callback) {
    req.on('response', function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            if (response.statusCode !== 200) {
                callback(new Error(response.statusCode + ' ' + response.statusMessage));
            } else {
                callback(null, body);
            }
        });
    });
    req.on('error', function (error) {
        callback(error);
    });
    req.end();
};

var createRequest = function (path, method, headers) {
    headers['User-Agent'] = 'GitHubAPI/1.1';

    return https.request({
        protocol: 'https:',
        host: 'api.github.com',
        path: path,
        method: method || 'GET',
        headers: headers
    });
};

var request = function (path, params, callback) {
    flow.serial([
        function (next) {
            fs.readFile(TOKEN_PATH, 'utf-8', function (err, token) {
                next(null, err ? '' : '?access_token=' + token.trim());
            });
        },
        function (token, next) {
            path += token;
            var req = createRequest(path, params.method, params.headers || {});
            if (params.content) {
                req.write(params.content);
            }
            requestHandler(req, next);
        }
    ], callback);
};

var bodyParse = function (path, callback) {
    flow.serial([
        function (next) {
            request(path, {}, next);
        },
        flow.makeAsync(JSON.parse)
    ], callback);
};

exports.getRepos = function (param, callback) {
    var type = Object.keys(param);

    return bodyParse('/' + type + '/' + param[type] + '/repos', callback);
};

exports.getRepo = function (param, callback) {
    var type = Object.keys(param);

    return bodyParse('/repos/' + type + '/' + param[type], callback);
};

exports.getReadme = function (param, callback) {
    var type = Object.keys(param);
    flow.serial([
        function (next) {
            var path = '/repos/' + type + '/' + param[type] + '/readme';
            bodyParse(path, function (err, data) {
                if (err) {
                    next(err);
                } else {
                    data = new Buffer(data.content, data.encoding).toString('utf-8');
                    next(null, { markdown: data });
                }
            });
        },
        function (readme, next) {
            request('/markdown/raw', {
                method: 'POST',
                headers: { 'Content-Type': 'text/x-markdown' },
                content: readme.markdown
            }, function (err, data) {
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
