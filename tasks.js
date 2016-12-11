'use strict';

var githubApi = require('./taskApi');
var flow = require('flow');

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = false;

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */

var ORGANIZATION = 'urfu-2016';

exports.getList = function (category, callback) {
    // var result = [];
    githubApi.getRepos(ORGANIZATION, function (err, data) {
        if (err) {
            callback(err, null);
        }
        var arr = data.filter(function (task) {
            return task.name.indexOf(category + '-task') !== -1;
        });
        var result = arr.map(function (task) {
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
        }
    ], callback);
};
