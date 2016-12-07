'use strict';

var github = require('./githubapi');
var flow = require('flow');

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
    github.getRepos('orgs', 'urfu-2016', function (err, repos) {
        if (err) {
            callback(err);
        } else {
            var res = repos.filter(function (repo) {
                return repo.name.indexOf(category + '-task') === 0;
            }).map(function (repo) {
                return {
                    name: repo.name,
                    description: repo.description
                };
            });
            callback(null, res);
        }
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    flow.parallel([
        function (next) {
            github.getRepo('urfu-2016', task, next);
        },
        function (next) {
            github.getReadme('urfu-2016', task, next);
        }
    ], Infinity, function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                name: data[0].name,
                description: data[0].description,
                markdown: data[1].markdown,
                html: data[1].html
            });
        }
    });
};
