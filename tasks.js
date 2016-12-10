'use strict';

exports.isStar = false;
var requestsAPI = require('./requestsAPI');

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    var listTasks = [];
    requestsAPI.request('/orgs/urfu-2016/repos', function (err, data) {
        if (err) {
            callback(err, data);
        }
        listTasks = data.filter(function (task) {
            return task.name.indexOf('javascript-task-') >= 0;
        });
        callback(err, listTasks);
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var result = {};
    requestsAPI.request('/repos/urfu-2016/' + task + '/readme', function (err1, data1) {
        requestsAPI.request('/repos/urfu-2016/' + task, function (err2, data2) {
            if (err2) {
                callback(err2, data2);
            }
            result.name = data2.name;
            result.description = data2.description;
            callback(undefined, result);
        });
        if (err1) {
            callback(err1, data1);
        }
        result.markdown = new Buffer(data1.content, 'base64').toString('utf-8');
    });
};
