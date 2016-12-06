'use strict';

var api = require('./api.js');
var flow = require('flow.js');

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = true;

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    api.getOrganizationRepos('urfu-2016', function (error, repos) {
        if (error) {
            callback(error);

            return;
        }

        var result = repos
            .filter(function (repo) {
                return repo.name.startsWith(category + '-task');
            })
            .map(function (repo) {
                return {
                    name: repo.name,
                    description: repo.description
                };
            });

        callback(null, result);
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    flow.serial([
        function (next) {
            api.getRepo('urfu-2016', task, function (error, repo) {
                if (error) {
                    next(error);

                    return;
                }

                next(null, {
                    name: repo.name,
                    description: repo.description
                });
            });
        },

        function (data, next) {
            api.getReadme('urfu-2016', task, function (error, readme) {
                if (error) {
                    next(error);

                    return;
                }

                data.markdown = new Buffer(readme.content, readme.encoding).toString('utf-8');
                next(null, data);
            });
        },

        function (data, next) {
            api.renderMarkdown(data.markdown, function (error, html) {
                if (error) {
                    next(error);

                    return;
                }

                data.html = html;
                next(null, data);
            });
        }
    ], callback);
};
