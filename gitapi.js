'use strict';

var HOSTNAME = 'api.github.com';

function getToken() {
    var fs = require('fs');
    var token;
    try {
        token = fs.readFileSync('token.txt', 'utf-8').trim();
    } catch (err) {
        token = '';
    }

    return token;
}

function getOptions(path) {
    var options = {
        hostname: HOSTNAME,
        method: 'GET',
        path: path,
        headers: {
            'User-Agent': 'node.js'
        }
    };
    var oAuthToken = getToken();
    if (oAuthToken) {
        options.headers.Authorization = 'token ' + oAuthToken;
    }

    return options;
}

exports.repositoryRequest = function (path, callback) {
    var https = require('https');
    var req;
    try {
        req = https.request(getOptions(path));
    } catch (err) {
        callback(err);

        return;
    }
    req.on('response', function (res) {
        var data = '';
        res.on('data', function (chunked) {
            data += chunked.toString('utf8');
        });
        res.on('error', function (err) {
            callback(err);
        });
        res.on('end', function () {
            callback(null, data);
        });
    });
    req.on('error', function (err) {
        callback(err);
    });
    req.end();
};
