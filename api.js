'use strict';

var https = require('https');

var API_HOST = 'api.github.com';

function makeRequest(options, headers, isJson, callback) {
    options = Object.assign({}, options, {
        hostname: API_HOST
    });
    options.headers = Object.assign({}, headers, {
        'User-Agent': 'node.js'
    });

    var request = https.request(options);

    request.on('response', function (response) {
        var body = '';

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            if (isJson) {
                var result = JSON.parse(body);

                if ('message' in result) {
                    callback(new Error(result.message));
                } else {
                    callback(null, result);
                }
            } else {
                callback(null, body);
            }

        });
    });
    request.on('timeout', callback);
    request.on('error', callback);

    return request;
}

exports.getOrganizationRepos = function (organization, callback) {
    var path = '/orgs/' + organization + '/repos';

    var request = makeRequest({ path: path }, {}, true, callback);
    request.end();
};

exports.getRepo = function (owner, repo, callback) {
    var path = '/repos/' + owner + '/' + repo;

    var request = makeRequest({ path: path }, {}, true, callback);
    request.end();
};

exports.getReadme = function (owner, repo, callback) {
    var path = '/repos/' + owner + '/' + repo + '/readme';

    var request = makeRequest({ path: path }, {}, true, callback);
    request.end();
};

exports.renderMarkdown = function (text, callback) {
    var options = {
        path: '/markdown/raw',
        method: 'POST'
    };
    var headers = {
        'Content-Length': Buffer.byteLength(text),
        'Content-Type': 'text/x-markdown'
    };
    var request = makeRequest(options, headers, false, callback);

    request.write(text);
    request.end();
};
