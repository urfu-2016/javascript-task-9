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

/**
 * Получаем опции для запроса
 * @param {String} requestPath – путь до репозитория, куда api должно обратиться
 * @returns {Object}
 */
function getOptions(requestPath) {
    return {
        hostname: 'api.github.com',
        path: requestPath + '?auth_token=' + TOKEN,
        method: 'GET',
        headers: {
            'User-Agent': 'another-agent'
        }
    };
}

/**
 * Запрашиваем данные
 * @param {Object} options – опции для запроса
 * @param {Function} callback
 */
function createRequest(options, callback) {
    var finalResult = '';
    var result = '';
    var req = https.request(options, function (res) {
        res.on('data', function (data) {
            result += data;
        });
        res.on('end', function () {
            if (res.statusCode !== 200) {
                callback(new Error('response code ' + res.statusCode));

                return;
            }
            try {
                finalResult = Buffer.from(result);
                callback(null, JSON.parse(finalResult.toString()));
            } catch (error) {
                callback(error);
            }
        });

    });

    req.on('error', function (error) {
        console.error(error);
    });

    req.end();
}

exports.getRepositories = function (requestPath, callback) {
    createRequest(getOptions(requestPath), callback);
};

exports.getRepositoriesInfo = function (requestPath, callback) {
    createRequest(getOptions(requestPath), callback);
};
