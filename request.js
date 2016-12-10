'use strict';

var https = require('https');

exports.get = function (options, callback) {
    https.get(options, getResponseCallback(callback)).end();
};
exports.post = function (options, body, callback) {
    options.method = 'POST';
    var request = https.request(options, getResponseCallback(callback));
    request.end(body);
};

function getResponseCallback(callback) {
    return function (response) {
        var data = '';
        var hasError = false;
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('error', function (err) {
            callback(err);
            hasError = true;
        });
        response.on('end', function () {
            if (!hasError) {
                callback(null, data);
            }
        });
    };
}
