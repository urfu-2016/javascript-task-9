'use strict';

var GitHubClient = require('./GitHubClient.js');
var fs = require('fs');
var flow = require('flow.gallyam');

var token;
try {
    token = fs.readFileSync('token.txt', 'utf-8');
} catch (e) {
    console.info('There is no token file');
}

var gitHubClient = new GitHubClient(token);

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
    flow.serial([
        gitHubClient.getRepos,
        flow.makeAsync(function (data) {
            return data.filter(function (repo) {
                return repo.name.match(category + '-task-\\d+');
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
