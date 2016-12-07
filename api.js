'use strict';

var https = require('https');

var GITHUB = 'api.github.com';
var MARKDOWN = '/markdown/raw';
var USER_AGENT = 'Yet-Another-Github-Api-App';

function getReposPath(organization) {
    return '/orgs/' + organization + '/repos';
}

function getRepoPath(organization, repo) {
    return '/repos/' + organization + '/' + repo;
}

function getRepoReadmePath(organization, repo) {
    return getRepoPath(organization, repo) + '/readme';
}

function getOptions(path) {
    return {
        method: 'GET',
        host: GITHUB,
        path: path,
        headers: {
            'User-Agent': USER_AGENT
        }
    };
}

function postOptions(path) {
    return {
        method: 'POST',
        host: GITHUB,
        path: path,
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'text/plain'
        }
    };
}

function getString(options, callback, data) {
    function requestCallback(response) {
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
    }

    var request = https.request(options, requestCallback);
    if (data) {
        request.write(data);
    }
    request.end();
}

function returnJson(callback, error, string) {
    if (error) {
        callback(error, null);
    }

    var data = null;
    try {
        data = JSON.parse(string);
    } catch (e) {
        error = e;
    }

    callback(error, data);
}

exports.getRepos = function (organization, callback) {
    getString(getOptions(getReposPath(organization)), returnJson.bind(null, callback));
};

exports.getRepo = function (organization, repo, callback) {
    getString(getOptions(getRepoPath(organization, repo)), returnJson.bind(null, callback));
};

exports.getRepoReadme = function (organization, repo, callback) {
    getString(getOptions(getRepoReadmePath(organization, repo)), returnJson.bind(null, callback));
};

exports.getHtml = function (markdown, callback) {
    getString(postOptions(MARKDOWN), callback, markdown);
};
