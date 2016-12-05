'use strict';

var fs = require('fs');
var http = require('https');

var token;
try {
    token = fs.readFileSync('token.txt', 'utf-8');
} catch (e) {
    console.info('no file');
}

function handleError(req, callback) {
    req.on('error', function (err) {
        callback(err, null);
    });
}

function httpplain(callback, res) {
    var body = '';
    res.on('data', function (chunk) {
        body += chunk;
    });
    res.on('end', function () {
        callback(null, body);
    });
}

function httpJson(callback, res) {
    httpplain(function (err, body) {
        if (err) {
            callback(err, null);

            return;
        }
        try {
            callback(null, JSON.parse(body));
        } catch (e) {
            callback(e, null);
        }
    }, res);
}

exports.repoList = function (callback) {
    var options = {
        protocol: 'https:',
        host: 'api.github.com',
        path: '/orgs/urfu-2016/repos?access_token=' + token,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)' }
    };
    var req = http.request(options, httpJson.bind(null, callback));
    handleError(req, callback);
    req.end();
};

exports.repoInfo = function (repo, callback) {
    var options = {
        protocol: 'https:',
        host: 'api.github.com',
        path: '/repos/urfu-2016/' + repo + '?access_token=' + token,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)' }
    };
    var req = http.request(options, httpJson.bind(null, callback));
    handleError(req, callback);
    req.end();
};


exports.markdownToHTML = function (md, callback) {
    var postData = String(md);
    var options = {
        protocol: 'https:',
        host: 'api.github.com',
        path: '/markdown/raw',
        method: 'POST',
        headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
            'Content-Length': Buffer.byteLength(postData),
            'Content-Type': 'text/x-markdown'
        }
    };
    var req = http.request(options, httpplain.bind(null, callback));
    handleError(req, callback);
    req.write(postData);
    req.end();
};
