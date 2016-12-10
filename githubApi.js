'use strict';

var fs = require('fs');
var https = require('https');
var url = require('url');

var API_URL = 'api.github.com';
var USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64)';
var TOKEN = '';
try {
    TOKEN = fs.readFileSync('token.txt', { encoding: 'utf-8' }).trim();
    TOKEN = new Buffer(TOKEN).toString('ascii');
} catch (e) {
    console.info(e.message);
}
function getOptions(orgPath) {
    return {
        host: API_URL,
        path: orgPath.path,
        headers:
        {
            'Authorization': 'Bearer ' + TOKEN,
            'User-Agent': USER_AGENT
        }
    };
}

function getResponseCallback(reject, resolve) {
    return function (response) {
        var data = '';
        var hasError = false;
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('error', function (err) {
            reject(err);
            hasError = true;
        });
        response.on('end', function () {
            if (!hasError) {
                resolve(data);
            }
        });
    };
}

exports.getRepos = function (org, callback) {
    var orgPath = url.parse('/orgs/' + org + '/repos');
    function resolve(data) {
        try {
            callback(null, JSON.parse(data));
        } catch (e) {
            callback(e);
        }
    }
    https.get(getOptions(orgPath), getResponseCallback(callback, resolve)).end();
};

exports.getRepo = function (owner, repo, callback) {
    var orgPath = url.parse('/repos/' + owner + '/' + repo);
    function resolve(data) {
        try {
            callback(null, JSON.parse(data));
        } catch (e) {
            callback(e);
        }
    }
    https.get(getOptions(orgPath), getResponseCallback(callback, resolve)).end();
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
    https.get(getOptions(orgPath), getResponseCallback(callback, resolve)).end();
};

exports.postHtmlMarkdown = function (markdown, callback) {
    var options = getOptions(url.parse('/markdown/raw'));
    options.headers['Content-Type'] = 'text/plain';
    options.method = 'POST';
    function contentResolve(data) {
        callback(null, data);
    }
    var request = https.request(options, getResponseCallback(callback, contentResolve));
    request.write(markdown);
    request.end();
};
