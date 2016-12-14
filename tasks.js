'use strict';

var flow = require('flow');
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
    api.getReposAsync('urfu-2016', function (err, repos) {
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
            api.getRepoAsync('urfu-2016', task, wrapperCallback.bind(null, function (repo) {
                return {
                    name: repo.name,
                    description: repo.description
                };
            }, next))
        },

        function (repo, next) {
            api.getReadmeAsync('urfu-2016', task, wrapperCallback.bind(null, function (readme) {
                repo.markdown = new Buffer(readme.content, readme.encoding).toString('utf-8');

                return repo;
            }, next))
        },

        function (repo, next) {
            api.readmeToHtml(repo.markdown, wrapperCallback.bind(null, function (html) {
                repo.html = html;

                return repo;
            }, next))
        }
    ], callback);
};

function wrapperCallback(func, next, err, data) {
    if (err) {
        next(err);

        return;
    }
    data = func(data);
    next(err, data);
}
