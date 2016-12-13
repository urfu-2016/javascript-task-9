'use strict';

var requestApi = require('./requestApi.js');
var flow = require('flow');

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
    requestApi.getReposByCategory(category, callback);
};

/*
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var oneRepo = {};
    flow.serial([
        requestApi.getOneRepo.bind(global, task),

        function (repo, nextFunction) {
            oneRepo.name = repo.name;
            oneRepo.description = repo.description;
            nextFunction(null);
        },

        requestApi.getRepoMarkdown.bind(global, task),

        function (readme, nextFunction) {
            oneRepo.markdown = readme.markdown;
            nextFunction(null);
        },

        function (nextFunction) {
            requestApi.getRepoHtml(oneRepo.markdown, nextFunction);
        },

        function (html, nextFunction) {
            oneRepo.html = html;
            nextFunction(null, oneRepo);
        }
    ], callback);
};
