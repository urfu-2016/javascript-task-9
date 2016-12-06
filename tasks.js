'use strict';

var GitHubClient = require('./GitHubClient.js');
var fs = require('fs');
var flow = require('flow.gallyam');

var gitHubClient = new GitHubClient(fs.readFileSync('token.txt'));

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
    if (['markup', 'javascript', 'demo'].indexOf(category) === -1) {
        throw new Error('Unknown category: ' + category);
    }

    gitHubClient.getRepos(function (error, data) {
        if (error) {
            callback(error);
        } else {
            callback(null, data
                .filter(function (repo) {
                    return repo.name.match(category + '-task-\\d+');
                })
                .map(function (repo) {
                    return {
                        name: repo.name,
                        description: repo.description
                    };
                }));
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
        gitHubClient.getRepo.bind(gitHubClient, task),
        function (data, next) {
            gitHubClient.getFileContent(task, 'readme', function (error, markdown) {
                data.markdown = markdown;
                next(error, data);
            });
        },
        function (data, next) {
            gitHubClient.renderMarkdown(data.markdown, function (error, html) {
                data.html = html;
                next(error, data);
            });
        }
    ], callback);
};
