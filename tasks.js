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
    github.getRepos({ 'orgs': 'urfu-2016' }, function (err, repos) {
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
    flow.serial([
        github.getRepo({ 'urfu-2016': task }),
        github.getReadme,
        github.addHTML
    ], function (err, repo) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                name: repo.name,
                description: repo.description,
                markdown: repo.readme.markdown,
                html: repo.readme.html
            });
        }
    });
};
