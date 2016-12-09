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

exports.getList = function (category, callback) {
    var result = [];
    githubApi.getRepos('urfu-2016', function (err, data) {
        if (err) {
            callback(err, null);
        }
        var arr = data.filter(function (task) {
            return task.name.indexOf(category + '-task') + 1;
        });
        arr.forEach(function (item) {
            result.push({ name: item.name, description: item.description });
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
            githubApi.getRepoInfo(task, 'urfu-2016', function (err, data) {
                result.name = data.name;
                result.description = data.description;
                next(err, result);
            });
        },
        function (results, next) {
            githubApi.getReadMe(task, 'urfu-2016', function (err, data) {
                if (err) {
                    callback(err, null);
                }
                try {
                    result.markdown = new Buffer(data.content, 'base64').toString('utf-8');
                } catch (e) {
                    result.markdown = '';
                }
                next(err, result);
            });
        }
    ], callback);
};
