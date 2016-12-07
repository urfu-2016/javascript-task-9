'use strict';

var https = require('https');
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

var request = function (options, content, callback) {
    var req = https.request(options);
    if (content) {
        req.write(content);
    }
    requestHandler(req, callback);
};

module.exports = request;

module.exports.json = function (options, content, callback) {
    flow.serial([
        function (next) {
            request(options, content, next);
        },
        flow.makeAsync(JSON.parse)
    ], callback);
};
