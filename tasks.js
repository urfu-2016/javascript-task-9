'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = true;
var flow = require('flow');
var gitApi = require('./gitApi.js');
var REPO_PATH = '/repos/urfu-2016/';
var REPOS_PATH = '/orgs/urfu-2016/repos';
var GET = 'GET';
var POST = 'POST';
var README = '/readme';
var MARKDOWN = '/markdown/raw';


/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    var cb = function (err, res) {
        if (err) {
            callback(err, null);

            return;
        }
        callback(null, res.filter(function (item) {
            return item.name.indexOf(category + '-task-') === 0;
        }).map(function (item) {
            return {
                name: item.name,
                description: item.description
            };
        }));
    };
    gitApi.getRequest(REPOS_PATH, GET, null, cb);
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */

exports.loadOne = function (task, callback) {
    var getCallback = function (next, data) {
        return function (err, res) {
            if (err) {
                next(err, null);

                return;
            }
            if (res.name === 'README.md') {
                data.markdown = new Buffer(res.content, 'base64').toString();
                next(null, data);

                return;
            }
            if (res.name === task) {
                data.name = res.name;
                data.description = res.description;
                next(null, data);

                return;
            }
            data.html = res;
            next(null, data);
        };
    };

    var pathRepo = REPO_PATH + task;
    var pathReadme = pathRepo + README;
    flow.serial([
        function (next) {
            gitApi.getRequest(pathRepo, GET, null, getCallback(next, {}));
        },
        function (data, next) {
            gitApi.getRequest(pathReadme, GET, null, getCallback(next, data));
        },
        function (data, next) {
            gitApi.getRequest(MARKDOWN, POST, data.markdown, getCallback(next, data));
        }
    ], callback);
};
