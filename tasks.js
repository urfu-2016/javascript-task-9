'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = true;

var https = require('https');
var flow = require('flow');

var GITHUB = 'api.github.com';
var REPOS = '/orgs/urfu-2016/repos';
var REPO = '/repos/urfu-2016';
var MARKDOWN = '/markdown/raw';
var USER_AGENT = 'Yet-Another-Github-Api-App';

function getOptions(path) {
    return {
        method: 'GET',
        host: GITHUB,
        path: path,
        headers: {
            'User-Agent': USER_AGENT
        }
    };
}

function postOptions(path) {
    return {
        method: 'POST',
        host: GITHUB,
        path: path,
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'text/plain'
        }
    };
}

function getString(options, callback, data) {
    function requestCallback(response) {
        var buffer = '';
        var callbackCalled = false;

        response.on('data', function (chunk) {
            buffer += chunk;
        });

        response.on('error', function (error) {
            callbackCalled = true;
            callback(error, null);
        });

        response.on('end', function () {
            if (!callbackCalled) {
                callback(null, buffer);
            }
        });
    }

    var request = https.request(options, requestCallback);
    if (data) {
        request.write(data);
    }
    request.end();
}

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    flow.serial([
        function (next) {
            getString(getOptions(REPOS), next);
        },
        flow.makeAsync(function (string) {
            return JSON.parse(string);
        }),
        flow.makeAsync(function (json) {
            return json.filter(function (repo) {
                return repo.name.indexOf(category + '-task-') === 0;
            })
            .map(function (repo) {
                return {
                    name: repo.name,
                    description: repo.description
                };
            });
        })
    ], callback);
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    flow.serial([
        function (next) {
            flow.map([REPO + '/' + task, REPO + '/' + task + '/readme'], function (path, cb) {
                getString(getOptions(path), cb);
            }, next);
        },
        flow.makeAsync(function (data) {
            return {
                data: JSON.parse(data[0]),
                markdown: new Buffer(JSON.parse(data[1]).content, 'base64').toString('utf8')
            };
        }),
        function (data, next) {
            getString(postOptions(MARKDOWN), function (error, html) {
                console.info(html);
                next(error, {
                    name: data.data.name,
                    description: data.data.description,
                    markdown: data.markdown,
                    html: html
                });
            }, data.markdown);
        }
    ], callback);
};
