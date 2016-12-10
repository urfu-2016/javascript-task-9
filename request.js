'use strict';

var https = require('https');

exports.get = function (options, onSuccess, onError) {
    https.get(options, getResponseCallback(onError, onSuccess)).end();
};
exports.post = function (options, body, onSuccess, onError) {
    options.method = 'POST';
    var request = https.request(options, getResponseCallback(onError, onSuccess));
    request.end(body);
};

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
