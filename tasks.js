'use strict';

var api = require('./api.js');
var flow = require('flow.js');

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = true;

var ALLOWED_CATEGORIES = ['demo', 'javascript', 'markup'];

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    if (ALLOWED_CATEGORIES.indexOf(category) === -1) {
        callback(1);

        return;
    }

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

                next(null, repo);
            });
        },

        function (repo, next) {
            api.getReadme('urfu-2016', task, function (error, readme) {
                if (error) {
                    next(error);

                    return;
                }

                next(null, {
                    repo: repo,
                    readme: new Buffer(readme.content, readme.encoding).toString('utf-8')
                });
            });
        },

        function (data, next) {
            api.renderMarkdown(data.readme, function (error, html) {
                if (error) {
                    next(error);

                    return;
                }

                data.html = html;
                next(null, data);
            });
        }
    ], function (error, data) {
        if (error) {
            callback(error);

            return;
        }

        callback(null, {
            name: data.repo.name,
            description: data.repo.description,
            markdown: data.readme,
            html: data.html
        });
    });

};
