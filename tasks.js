'use strict';

exports.isStar = false;
var requestsAPI = require('./api');

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    var listTasks = [];
    requestsAPI.request('/orgs/urfu-2016/repos', function (err, data) {
        if (err) {
            callback(err);

            return;
        }
        listTasks = data.filter(function (task) {
            return task.name.indexOf(category + '-task-') >= 0;
        }).map(function (task) {
            return { 'description': task.description, 'name': task.name };
        });
        callback(undefined, listTasks);
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var result = {};
    requestsAPI.request('/repos/urfu-2016/' + task + '/readme', function (errReadme, readmeData) {
        requestsAPI.request('/repos/urfu-2016/' + task, function (errRepo, repoData) {
            if (errRepo) {
                callback(errRepo, undefined);

                return;
            }
            if (errReadme) {
                callback(errReadme, undefined);

                return;
            }
            result.name = repoData.name;
            result.description = repoData.description;
            callback(undefined, result);
        });
        try {
            result.markdown = new Buffer(readmeData.content, 'base64').toString('utf-8');
        } catch (err) {
            result.markdown = '';
        }
    });
};
