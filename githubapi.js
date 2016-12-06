'use strict';

var flow = require('flow');
var fs = require('fs');
var https = require('https');


var TOKEN_PATH = require('path').join(__dirname, 'token.txt');

var request = function (req, content) {
    return function (callback) {
        fs.readFile(TOKEN_PATH, 'utf-8', function (err, token) {
            if (!err) {
                req.path += '?access_token=' + token.trim();
            }
            if (content) {
                req.write(content);
            }
            req.on('response', function (response) {
                var body = '';
                response.on('data', function (chunk) {
                    body += chunk;
                });
                response.on('end', function () {
                    callback(null, body);
                });
            });
            req.on('error', function (error) {
                callback(error);
            });
            req.end();
        });
    };
};

var requestOption = function (path, method, headers) {
    return https.request({
        protocol: 'https:',
        host: 'api.github.com',
        path: path,
        method: method || 'GET',
        headers: headers || { 'User-Agent': 'GitHubAPI/1.1' }
    });
};

var repoInfo = function (path, callback) {
    var next = function (cb) {
        flow.serial([
            request(requestOption(path)),
            flow.makeAsync(JSON.parse)
        ], cb);
    };
    if (callback) {
        next(callback);
    } else {
        return next;
    }
};

exports.getRepos = function (param, callback) {
    var type = Object.keys(param);

    return repoInfo('/' + type + '/' + param[type] + '/repos', callback);
};

exports.getRepo = function (param, callback) {
    var type = Object.keys(param);

    return repoInfo('/repos/' + type + '/' + param[type], callback);
};

exports.getReadme = function (repo, callback) {
    flow.serial([
        request(requestOption('/repos/' + repo.owner.login + '/' + repo.name + '/readme')),
        flow.makeAsync(JSON.parse)
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            repo.readme = { markdown: new Buffer(data.content, data.encoding).toString('utf-8') };
            callback(null, repo);
        }
    });
};

exports.addHTML = function (repo, callback) {
    var req = requestOption('/markdown/raw', 'POST', {
        'User-Agent': 'GitHubAPI/1.1',
        'Content-Type': 'text/x-markdown'
    });
    request(req, repo.readme.markdown)(function (err, data) {
        if (err) {
            callback(err);
        } else {
            repo.readme.html = data;
            callback(null, repo);
        }
    });
};
