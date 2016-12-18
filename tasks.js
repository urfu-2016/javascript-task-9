'use strict';

var githubApi = require('./taskApi');
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

var ORGANIZATION = 'urfu-2016';

exports.getList = function (category, callback) {
    githubApi.getRepos(ORGANIZATION, function (err, data) {
        if (err) {
            callback(err, null);
        }
        var result = data.filter(function (task) {
            return task.name.indexOf(category + '-task') !== -1;
        }).map(function (task) {
            return { name: task.name, description: task.description };
        });
        callback(err, result);
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var result = {};
    flow.serial([
        function (next) {
            githubApi.getRepoInfo(task, ORGANIZATION, function (error, data) {
                if (error) {
                    callback(error, null);
                }
                result.name = data.name;
                result.description = data.description;
                next(error, result);
            });
        },
        function (results, next) {
            githubApi.getReadMe(task, ORGANIZATION, function (error, data) {
                try {
                    result.markdown = new Buffer(data.content, 'base64').toString('utf-8');
                } catch (e) {
                    result.markdown = '';
                    console.info('bad content');
                }
                next(error, result);
            });
        },
        function (results, next) {
            githubApi.getHTML(result.markdown, function (error, data) {
                try {
                    result.html = data;
                } catch (e) {
                    result.html = '';
                    console.info('bad html');
                }
                next(error, result);
            });
        }
    ], callback);
};
