'use strict';

var fs = require('fs');
var https = require('https');
var GITHUB_API = 'api.github.com';
var token = getToken();

function getToken() {
    try {
        return fs.readFileSync('token.txt', 'utf-8');
    } catch (e) {
        throw new TypeError('Error reading from file');
    }
}

exports.getOptions = function (path, method) {
    return {
        host: GITHUB_API,
        path: path,
        method: method,
        headers: {
            'User-Agent': 'gitApi.js',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'text/plain'
        }
    };
};

exports.getRequest = function (path, method, data, callback) {
    var options = exports.getOptions(path, method);
    var request = https.request(options);
    var parse = true;
    if (data) {
        request.write(data);
        parse = false;
    }
    request.on('response', function (response) {
        var resultData = '';
        var error = null;
        response.on('data', function (chunk) {
            resultData += chunk;
        })
        .on('error', function (err) {
            error = err;
        })
        .on('end', function () {
            var result = resultData;
            try {
                if (parse) {
                    result = JSON.parse(resultData);
                }
            } catch (e) {
                callback(e);

                return;
            }
            callback(error, result);
        });
    });
    request.end();
};
