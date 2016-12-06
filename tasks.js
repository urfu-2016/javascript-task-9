'use strict';

var githubApi = require('./githubApi');
var flow = require('flow');

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = true;

function formatRepoInfo(fullRepoInfo) {
    var result = {
        name: fullRepoInfo.name,
        description: fullRepoInfo.description
    };
    if (fullRepoInfo.markdown) {
        result.markdown = fullRepoInfo.markdown;
    }
    if (fullRepoInfo.html) {
        result.html = fullRepoInfo.html;
    }

    return result;
}

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    githubApi.getRepoList(function (error, results) {
        if (error) {
            callback(error);

            return;
        }
        callback(null, results
        .filter(function (result) {
            return result.name.startsWith(category + '-task-');
        })
        .map(formatRepoInfo));
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    flow.serial([
        githubApi.getRepoInfo.bind(null, task),
        function (repoInfo, innerCallback) {
            githubApi.getRepoReadme(repoInfo.name, function (error, result) {
                if (error) {
                    innerCallback(error);

                    return;
                }
                repoInfo.markdown = result;
                innerCallback(null, repoInfo);
            });
        },
        function (repoInfo, innerCallback) {
            githubApi.parseMarkdown(repoInfo.markdown, function (error, result) {
                if (error) {
                    innerCallback(error);

                    return;
                }
                repoInfo.html = result;
                innerCallback(null, formatRepoInfo(repoInfo));
            });
        }], callback);
};
