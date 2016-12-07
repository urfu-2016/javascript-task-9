'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = true;

var flow = require('flow');
var api = require('./api');

var ORGANIZATION = 'urfu-2016';

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    flow.serial([
        function (next) {
            api.getRepos(ORGANIZATION, next);
        },
        flow.makeAsync(function (repos) {
            return repos
                .filter(function (repo) {
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
            flow.map([api.getRepo, api.getRepoReadme], function (func, cb) {
                func(ORGANIZATION, task, cb);
            }, next);
        },
        flow.makeAsync(function (data) {
            return {
                name: data[0].name,
                description: data[0].description,
                markdown: new Buffer(data[1].content, 'base64').toString('utf8')
            };
        }),
        function (data, next) {
            api.getHtml(data.markdown, function (error, html) {
                data.html = html;
                next(error, data);
            });
        }
    ], callback);
};
