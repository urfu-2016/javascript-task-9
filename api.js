'use strict';

var https = require('https');
var fs = require('fs');

var GITHUB = 'api.github.com';
var MARKDOWN_PATH = '/markdown/raw';
var USER_AGENT = 'Yet-Another-Github-Api-App';

var authorization = null;
try {
    authorization = 'token ' + fs.readFileSync('token.txt', 'utf-8');
} catch (e) {
    console.error(e);
}

function getReposPath(organization) {
    return ['/orgs', organization, 'repos'].join('/');
}

function getRepoPath(organization, repo) {
    return ['/repos', organization, repo].join('/');
}

function getRepoReadmePath(organization, repo) {
    return [getRepoPath(organization, repo), 'readme'].join('/');
}

function addAuthorization(options) {
    if (authorization) {
        options.headers.Authorization = authorization;
    }

    return options;
}

function getOptions(path) {
    return addAuthorization({
        host: GITHUB,
        path: path,
        headers: {
            'User-Agent': USER_AGENT
        }
    });
}

function postOptions(path) {
    return addAuthorization({
        method: 'POST',
        host: GITHUB,
        path: path,
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'text/plain'
        }
    });
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
    getString(getOptions(getReposPath(organization)), returnJson(callback));
};

exports.getRepo = function (organization, repo, callback) {
    getString(getOptions(getRepoPath(organization, repo)), returnJson(callback));
};

exports.getRepoReadme = function (organization, repo, callback) {
    getString(getOptions(getRepoReadmePath(organization, repo)), returnJson(callback));
};

exports.getHtml = function (markdown, callback) {
    getString(postOptions(MARKDOWN_PATH), callback, markdown);
};
