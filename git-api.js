'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');
var PATH_TO_TOKEN = path.join(__dirname, 'token.txt');
var TOKEN = '';

try {
    TOKEN = fs.readFileSync(PATH_TO_TOKEN, 'utf-8');
} catch (error) {
    console.info(error);
}

function getOptions(requestPath) {
    var options = {
        hostname: 'api.github.com',
        path: requestPath + '?auth_token=' + TOKEN,
        method: 'GET',
        headers: {
            'User-Agent': 'another-agent'
        }
    };

    return options;
}

function isSuccessfully(res) {
    var successCode = 200;

    return res.statusCode === successCode;
}

function createRequest(options, callback) {
    var finalResult = '';
    var result = '';
    var req = https.request(options, function (res) {
        res.on('data', function (data) {
            result += data;
        });
        res.on('end', function () {
            if (isSuccessfully(res)) {
                try {
                    finalResult = Buffer.from(result);
                    callback(null, JSON.parse(finalResult.toString()));
                } catch (error) {
                    callback(error);
                }
            } else {
                callback(new Error());
            }
        });

    });
    req.on('error', callback);
    req.end();
}

exports.getRepositories = function (callback) {
    createRequest(getOptions('/orgs/urfu-2016/repos'), callback);
};

exports.getRepositoriesInfo = function (requestPath, callback) {
    createRequest(getOptions(requestPath), callback);
};
