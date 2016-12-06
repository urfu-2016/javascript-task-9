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
            'Authorization': 'Basic ' + new Buffer('Gebon:' + token).toString('base64'),
            'Content-Type': 'text/plain;charset=utf-8',
            'User-Agent': 'Gallyam repo browser'
        }
    };
}

function makeRequest(options, next, postData) {
    var request = https.request(options,
        function (response) {
            var content = '';
            response.on('data', function (chunk) {
                content += chunk;
            });
            response.on('end', function () {
                next(null, content);
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
    options.headers['Accept-Encoding'] = 'cp1251';
    operations = [makeRequest.bind(null, options), flow.makeAsync(JSON.parse)]
        .concat(operations || []);
    flow.serial(operations, callback);
}

GitHubClient.prototype.getRepos = function (callback) {
    var options = createDefaultOptions(this.token, '/orgs/urfu-2016/repos');
    applyOperationsWithPreprocessing(options, callback);
};

GitHubClient.prototype.getRepo = function (repoName, callback) {
    var options = createDefaultOptions(this.token, '/repos/urfu-2016/' + repoName);
    applyOperationsWithPreprocessing(options, callback);
};

GitHubClient.prototype.getFileContent = function (repoName, fileName, callback) {
    var options = createDefaultOptions(this.token, '/repos/urfu-2016/' + repoName + '/' + fileName);
    applyOperationsWithPreprocessing(options, callback, [
        flow.makeAsync(function (data) {
            return new Buffer(data.content, 'base64').toString('utf8');
        })
    ]);
};

GitHubClient.prototype.renderMarkdown = function (markdown, callback) {
    var options = createDefaultOptions(this.token, '/markdown/raw', 'POST');
    makeRequest(options, callback, markdown);
};

module.exports = GitHubClient;
