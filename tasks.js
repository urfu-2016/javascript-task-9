'use strict';

var flow = require('./flow');
var api = require('./api-github');

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
    api.getRepos('urfu-2016', function (err, repos) {
        if (err) {
            callback(err);

            return;
        }
        var filteredRepos = repos
            .filter(function (repo) {
                return repo.name.indexOf(category + '-task-') === 0;
            })
            .map(function (repo) {
                return {
                    name: repo.name,
                    description: repo.description
                };
            });
        callback(null, filteredRepos);
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
            api.getRepo('urfu-2016', task, function (err, repo) {
                if (err) {
                    next(err);
					
					return;
                }
                repo = {
                    name: repo.name,
                    description: repo.description
                };
                next(err, repo);
            });
        },

        function (repo, next) {
            api.getReadme('urfu-2016', task, function (err, readme) {
                if (err) {
                    next(err);
					
					return;
                }
                repo.markdown = new Buffer(readme.content, readme.encoding).toString('utf-8');
                next(err, repo);
            });
        },

        function (repo, next) {
            api.readmeToHtml(repo.markdown, function (err, html) {
                if (err) {
                    next(err);
					
					return;
                }
                repo.html = html;
                next(err, repo);
            });
        }
    ], callback);
};
