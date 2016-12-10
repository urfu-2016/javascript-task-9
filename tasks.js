'use strict';

var GitHubClient = require('./GitHubClient.js');
var fs = require('fs');
var flow = require('flow.gallyam');

var ALLOWED_CATEGORIES = ['javascript', 'markup', 'demo'];

var token;
try {
    token = fs.readFileSync('token.txt', 'utf-8');
} catch (e) {
    console.info('There is no token file');
    console.info(e);
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
    if (ALLOWED_CATEGORIES.indexOf(category) === -1) {
        throw new Error('Category "' + category + '" is not allowed to use');
    }
    flow.serial([
        gitHubClient.getRepos.bind(gitHubClient),
        flow.makeAsync(function (data) {
            return data.filter(function (repo) {
                return new RegExp(category + '-task-\\d+').test(repo.name);
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
