'use strict';

var fs = require('fs');
var url = require('url');
var request = require('./request');

var API_HOSTNAME = 'api.github.com';
var USER_AGENT = 'Node.js';
var TOKEN = '';
try {
    TOKEN = fs.readFileSync('token.txt', 'ascii').trim();
} catch (e) {
    console.info(e.message);
}
function getOptions(orgPath) {
    return {
        host: API_HOSTNAME,
        path: orgPath.path,
        headers:
        {
            'Authorization': 'Bearer ' + TOKEN,
            'User-Agent': USER_AGENT
        }
    };
}

function getGetJSONParse(callback) {
    return function (data) {
        try {
            callback(null, JSON.parse(data));
        } catch (e) {
            callback(e);
        }
    };
}

exports.getRepos = function (org, callback) {
    var orgPath = url.parse('/orgs/' + org + '/repos');
    request.get(getOptions(orgPath), getGetJSONParse(callback), callback);
};

exports.getRepo = function (owner, repo, callback) {
    var orgPath = url.parse('/repos/' + owner + '/' + repo);
    request.get(getOptions(orgPath), getGetJSONParse(callback), callback);
};

exports.getMarkdown = function (owner, repo, callback) {
    var orgPath = url.parse('/repos/' + owner + '/' + repo + '/readme');
    function resolve(data) {
        var parsed = '';
        try {
            parsed = JSON.parse(data);
            var content = new Buffer(parsed.content, 'base64').toString('utf-8');
            callback(null, content);
        } catch (e) {
            callback(e);
        }
    }
    request.get(getOptions(orgPath), resolve, callback);
};

exports.renderMarkdown = function (markdown, callback) {
    var options = getOptions(url.parse('/markdown/raw'));
    options.headers['Content-Type'] = 'text/plain';
    function contentResolve(data) {
        callback(null, data);
    }
    request.post(options, markdown, contentResolve, callback);
};
