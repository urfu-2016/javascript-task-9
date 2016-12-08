'use strict';

var https = require('https');
var urllib = require('url');
var flow = require('flow');

var requestHandler = function (req, callback) {
    req.on('response', function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            if (response.statusCode === 200) {
                callback(null, body);
            } else {
                callback(new Error(response.statusCode + ' ' + response.statusMessage));
            }
        });
    });
    req.on('error', function (error) {
        callback(error);
    });
    req.end();
};

var requestParams = function (url, options) {
    var params = urllib.parse(url);
    params.method = options.method || 'GET';
    params.headers = options.headers || { };
    params.headers['User-Agent'] = params.headers['User-Agent'] || 'RequestModule/1.0';

    return params;
};

var request = function (url, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    var req = https.request(requestParams(url, options));
    if (options.body) {
        req.write(options.body);
    }
    requestHandler(req, callback);
};

module.exports = request;

module.exports.json = function (url, options, callback) {
    flow.serial([
        function (next) {
            request(url, options, next);
        },
        flow.makeAsync(JSON.parse)
    ], callback);
};
