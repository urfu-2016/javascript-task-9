'use strict';

function getToken() {
    var fs = require('fs');
    var token = '';
    try {
        token = '?access_token=' + fs.readFileSync('token.txt', 'utf8');
    } catch (err) {
        console.info(1);
    }

    return token;
}

function getOptions(path) {
    return {
        protocol: 'https:',
        host: 'api.github.com',
        path: path + getToken(),
        method: 'get',
        headers: { 'user-agent': 'BratBratokBratishka' }
    };
}

exports.request = function (path, call) {
    var https = require('https');
    var opt = getOptions(path);
    var callback = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            call(undefined, JSON.parse(str));
        });
    };
    https.request(opt, callback).end();
};
