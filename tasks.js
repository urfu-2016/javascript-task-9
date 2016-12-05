'use strict';

var flow = require('flow.gallyam');
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
    switch (category) {
        case 'markup':
            break;
        case 'javascript':
            break;
        case 'demo':
            break;
        default:
            throw new Error('Unknown category: ' + category);
    }
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    console.info(task, callback);
};
