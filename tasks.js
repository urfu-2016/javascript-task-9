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
    requestsAPI.request('/repos/urfu-2016/' + task + '/readme', function (err_readme, readme_data) {
        requestsAPI.request('/repos/urfu-2016/' + task, function (err_repo, repo_data) {
            if (err_repo) {
                callback(err_repo, undefined);

                return;
            }
            if (err_readme) {
                callback(err_readme, undefined);

                return;
            }
            result.name = repo_data.name;
            result.description = repo_data.description;
            callback(undefined, result);
        });
        try {
            result.markdown = new Buffer(readme_data.content, 'base64').toString('utf-8');
        } catch (err) {
            result.markdown = '';
        }
    });
};