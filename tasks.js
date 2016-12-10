'use strict';

exports.isStar = true;
var GithubRepositoriesAPI = require('./api.js');
var API = new GithubRepositoriesAPI('urfu-2016', 'token.txt');

/**
 * Выбрать нужные поля
 * @param {Array<String>} fields - поля
 * @param {Object} task - объект со ВСЕМИ полями
 * @returns {Object} - полученный обрезок
 */
function formatTask(fields, task) {
    return fields.reduce(function (result, field) {
        result[field] = task[field];

        return result;
    }, {});
}

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    API.getAllByCategory(category, function (error, data) {
        if (error) {
            callback(error);
        } else {
            var fields = ['name', 'description'];
            callback(null, data.map(formatTask.bind(null, fields)));
        }
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    API.getFullInfoById(task, function (error, data) {
        if (error) {
            callback(error);
        } else {
            var fields = ['name', 'description', 'markdown', 'html'];
            callback(null, formatTask(fields, data));
        }
    });
};
