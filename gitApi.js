'use strict';

var fs = require('fs');
var https = require('https');
var GITHUBAPI = 'api.github.com';
var token = getToken();

function getToken() {
    try {
        return fs.readFileSync('token.txt', { encoding: 'utf-8' });
    } catch (e) {
        return '';
    }
}


exports.getOptions = function (path, method) {
    return {
        host: GITHUBAPI,
        path: path,
        method: method,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64)',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'text/plain'
        }
    };
};

exports.getRequest = function (path, method, data, callback) {
    var options = exports.getOptions(path, method);
    var request = https.request(options);
    var parse = true;
    if (data !== null) {
        request.write(data);
        parse = false;
    }
    request.on('response', function (response) {
        var resultData = '';
        var error = null;
        response.on('data', function (chunk) {
            resultData += chunk;
        });
        response.on('error', function (err) {
            error = err;
        });
        response.on('end', function () {
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
