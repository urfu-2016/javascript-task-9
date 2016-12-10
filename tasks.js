'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = true;

var ORG = 'urfu-2016';
var githubApi = require('./githubApi');
var flow = require('flow');

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    githubApi.getRepos(ORG, function (err, repos) {
        if (err) {
            callback(err);
        }
        var tasks = repos.map(function (repo) {
            return {
                name: repo.name,
                description: repo.description
            };
        })
        .filter(function (task) {
            return task.name.indexOf(category + '-task') === 0;
        })
        .sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        callback(null, tasks);
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    flow.serial([
        function (cb) {
            githubApi.getRepo(ORG, task, cb);
        },
        function (data, cb) {
            githubApi.getMarkdown(ORG, task, function (err, markdown) {
                data.markdown = markdown;
                cb(err, data);
            });
        },
        function (data, cb) {
            githubApi.renderMarkdown(data.markdown, function (err, html) {
                data.html = html;
                cb(err, data);
            });
        }
    ], callback);
};
