'use strict';

var https = require('https');
var fs = require('fs');

var authorization = null;
try {
    authorization = 'token ' + fs.readFileSync('token.txt', 'utf-8');
} catch (e) {
    console.error(e);
}

function addAuthorization(options) {
    if (authorization) {
        options.headers.Authorization = authorization;
    }

    return options;
}

function getOptions(path) {
    return addAuthorization({
        host: 'api.github.com',
        path: path,
        headers: {
            'User-Agent': 'Yet-Another-Github-Api-App'
        }
    });
}

function postOptions(path) {
    var options = getOptions(path);
    options.method = 'POST';
    options.headers['Content-Type'] = 'text/plain';

    return options;
}

function getString(options, callback, data) {
    https.request(options, function (response) {
        var buffer = '';
        var callbackCalled = false;

        response.on('data', function (chunk) {
            buffer += chunk;
        });

        response.on('error', function (error) {
            callbackCalled = true;
            callback(error, null);
        });

        response.on('end', function () {
            if (!callbackCalled) {
                callback(null, buffer);
            }
        });
    }).end(data);
}

function returnJson(callback) {
    return function (error, data) {
        if (error) {
            callback(error, null);
        }

        try {
            callback(null, JSON.parse(data));
        } catch (e) {
            callback(e, null);
        }
    };
}

exports.getRepos = function (organization, callback) {
    getString(getOptions(['/orgs', organization, 'repos'].join('/')), returnJson(callback));
};

exports.getRepo = function (organization, repo, callback) {
    getString(getOptions(['/repos', organization, repo].join('/')), returnJson(callback));
};

exports.getRepoReadme = function (organization, repo, callback) {
    getString(getOptions(['/repos', organization, repo, 'readme'].join('/')), returnJson(callback));
};

exports.getHtml = function (markdown, callback) {
    getString(postOptions('/markdown/raw'), callback, markdown);
};
