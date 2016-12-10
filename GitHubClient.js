'use strict';

var https = require('https');
var flow = require('flow.gallyam');

var API_URL = 'api.github.com';
var HTTPS_PORT = 443;
var DEFAULT_HEADERS = {
    'Content-Type': 'text/plain;charset=utf-8',
    'User-Agent': 'Gallyam repo browser'
};

function createOptions(token, path, method) {
    return {
        hostname: API_URL,
        port: HTTPS_PORT,
        method: method || 'GET',
        path: path,
        headers: Object.assign({
            'Authorization': 'Basic ' + new Buffer(':' + token).toString('base64')
        }, DEFAULT_HEADERS)
    };
}

function makeRequest(options, next, postData) {
    var request = https.request(options,
        function (response) {
            var content = [];
            response.on('data', function (chunk) {
                content.push(chunk);
            });
            response.on('end', function () {
                next(null, Buffer.concat(content).toString());
            });
        }).on('error', next);
    if (typeof(postData) === 'string') {
        request.write(postData);
    }
    request.end();
}

function GitHubClient(token) {
    this.token = token;
}

function applyOperationsWithPreprocessing(options, callback, operations) {
    operations = [makeRequest.bind(null, options), flow.makeAsync(JSON.parse)]
        .concat(operations || []);
    flow.serial(operations, callback);
}

GitHubClient.prototype.getRepos = function (callback) {
    var options = createOptions(this.token, '/orgs/urfu-2016/repos');
    applyOperationsWithPreprocessing(options, callback);
};

GitHubClient.prototype.getRepo = function (repoName, callback) {
    var options = createOptions(this.token, '/repos/urfu-2016/' + repoName);
    applyOperationsWithPreprocessing(options, callback);
};

GitHubClient.prototype.getFileContent = function (repoName, fileName, callback) {
    var options = createOptions(this.token, '/repos/urfu-2016/' + repoName + '/' + fileName);
    applyOperationsWithPreprocessing(options, callback, [
        flow.makeAsync(function (data) {
            return new Buffer(data.content, 'base64').toString('utf8');
        })
    ]);
};

GitHubClient.prototype.renderMarkdown = function (markdown, callback) {
    var options = createOptions(this.token, '/markdown/raw', 'POST');
    makeRequest(options, callback, markdown);
};

module.exports = GitHubClient;
