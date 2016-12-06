'use strict';

var https = require('https');
var flow = require('flow.gallyam');

var API_URL = 'api.github.com';

function createDefaultOptions(token, path, method) {
    return {
        hostname: API_URL,
        port: 443,
        method: method || 'GET',
        path: path,
        headers: {
            'Authorization': 'Basic ' + new Buffer(':' + token).toString('base64'),
            'User-Agent': 'Gallyam repo browser'
        }
    };
}

function createRequest(options, callback) {
    return https.request(options,
        function (response) {
            var content = '';
            response.on('data', function (chunk) {
                content += chunk;
            });
            response.on('end', function () {
                callback(null, content);
            });
        }).on('error', function (error) {
            callback(error);
        });
}

function makeGetRequest(options, next) {
    var request = createRequest(options, next);
    request.end();
}

function makePostRequest(options, postData, next) {
    var request = createRequest(options, next);
    request.write(postData);
    request.end();
}

function GitHubClient(token) {
    this.token = token;
}

GitHubClient.prototype.getRepos = function (callback) {
    var options = createDefaultOptions(this.token, '/orgs/urfu-2016/repos');
    flow.serial([
        makeGetRequest.bind(null, options),
        flow.makeAsync(JSON.parse)
    ], callback);
};

GitHubClient.prototype.getRepo = function (repoName, callback) {
    var options = createDefaultOptions(this.token, '/repos/urfu-2016/' + repoName);
    flow.serial([
        makeGetRequest.bind(null, options),
        flow.makeAsync(JSON.parse)
    ], callback);
};

GitHubClient.prototype.getFileContent = function (repoName, fileName, callback) {
    var options = createDefaultOptions(this.token, '/repos/urfu-2016/' + repoName + '/' + fileName);
    flow.serial([
        makeGetRequest.bind(null, options),
        flow.makeAsync(JSON.parse),
        flow.makeAsync(function (data) {
            return new Buffer(data.content, 'base64').toString('utf8');
        })
    ], callback);
};

GitHubClient.prototype.renderMarkdown = function (markdown, callback) {
    var options = createDefaultOptions(this.token, '/markdown/raw', 'POST');
    makePostRequest(options, markdown, callback);
};

module.exports = GitHubClient;
