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
        function (next) {
            github.getRepo({ 'urfu-2016': task }, function (err, repo) {
                if (err) {
                    next(err);
                } else {
                    next(null, {
                        name: repo.name,
                        description: repo.description
                    });
                }
            });
        },
        function (repo, next) {
            github.getReadme({ 'urfu-2016': task }, function (err, readme) {
                if (err) {
                    next(err);
                } else {
                    repo.markdown = readme.markdown;
                    repo.html = readme.html;
                    next(null, repo);
                }
            });
        }
    ], callback);
};
