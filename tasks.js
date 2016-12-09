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
    if ((category !== 'javascript') && (category !== 'markup') && (category !== 'demo')) {
        callback(new Error('wrong category'));

        return;
    }

    var cb = function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var items;
            try {
                items = JSON.parse(body);
                items = items.filter(function (item) {
                    return item.name.indexOf(category + '-task') !== -1;
                }).map(function (task) {
                    return {
                        name: task.name,
                        description: task.description
                    };
                });
                callback(null, items);
            } catch (e) {
                callback(e);
            }
        } else if (error) {
            callback(error, null);
        } else {
            callback(new Error(response.statusCode));
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
            var repo;
            try {
                repo = JSON.parse(body);
                taskInfo.markdown = new Buffer(repo.content, repo.encoding).toString();
                callback(null, taskInfo);
            } catch (e) {
                callback(e, null);
            }
        } else if (error) {
            callback(error, null);
        } else {
            callback(new Error(response.statusCode));
        }
    };

    var repositoryCallback = function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var repo;
            try {
                repo = JSON.parse(body);

                taskInfo.name = repo.name;
                taskInfo.description = repo.description;
                api.getReadme(task, markdownCallback);
            } catch (e) {
                callback(e);
            }
        } else if (error) {
            callback(error, null);
        } else {
            callback(new Error(response.statusCode));
        }
    };

    api.getTaskInfo(task, repositoryCallback);
};
