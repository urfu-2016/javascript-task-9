'use strict';

function getToken() {
    var fs = require('fs');
    var token = '';
    try {
        token = '?access_token=' + fs.readFileSync('token.txt', 'utf8');
    } catch (err) {
        console.info('Токен не найден');
    }

    return token;
}

function getOptions(path) {
    return {
        protocol: 'https:',
        host: 'api.github.com',
        path: path + getToken(),
        method: 'get',
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 6.1)' }
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
            if (response.statusCode === 200) {
                try {
                    call(undefined, JSON.parse(str));
                } catch (err) {
                    call(err);
                }
            } else {
                call(new Error(response.statusMessage));
            }
        });
    };
    https.request(opt, callback).end();
};
