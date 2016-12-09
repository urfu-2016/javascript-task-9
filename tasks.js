'use strict';

var api = require('./gitAPI');

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
    var cb = function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var items = JSON.parse(body);
            console.info(items);
            items = items.filter(function (item) {
                return item.name.indexOf(category + '-task') !== -1;
            }).map(function (task) {
                return {
                    name: task.name,
                    description: task.description
                };
            });
            callback(null, items);
        } else {
            callback(error, null);
        }
    };

    api.getAllRepository(cb);
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var taskInfo = {};
    var markdownCallback = function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var repo = JSON.parse(body);
            taskInfo.markdown = new Buffer(repo.content, repo.encoding).toString()
                .replace(/\n/g, '\r\n');
            callback(null, taskInfo);
        } else {
            callback(error, null);
        }
    };

    var repositoryCallback = function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var repo = JSON.parse(body);
            taskInfo.name = repo.name;
            taskInfo.description = repo.description;
            api.getReadme(task, markdownCallback);
        } else {
            callback(error, null);
        }
    };

    api.getTaskInfo(task, repositoryCallback);
};
