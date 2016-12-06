'use strict';

var flow = require('flow');
var GithubRepositoriesAPI = require('./api.js');

var API = new GithubRepositoriesAPI('urfu-2016', 'token.txt');

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
exports.getList = function (category, callback) {
    var format = function (task) {
        return { name: task.name, description: task.description };
    };

    API.getAllByCategory(category, function (error, data) {
        if (error) {
            callback(error);
        }
        flow.map(data, format, callback);
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    API.getTaskById(task, callback);
};
