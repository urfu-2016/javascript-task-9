'use strict';

var gitApi = require('./git-api.js');
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
    gitApi.getRepositories(function (error, repositories) {
        result = repositories.filter(function (repository) {
            return repository.name.match(category + '-task');
        }).reduce(function (listRepositories, data) {
            listRepositories.push({
                name: data.name,
                description: data.description
            });

            return listRepositories;
        }, []);

        callback(null, result);
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    flow.serial([
        function (nextCallback) {
            var path = '/repos/urfu-2016/' + task;
            gitApi.getRepositoriesInfo(path, function (error, data) {
                nextCallback(null, {
                    name: data.name,
                    description: data.description
                });
            });
        },
        function (info, nextCallback) {
            var path = '/repos/urfu-2016/' + task + '/readme';
            gitApi.getRepositoriesInfo(path, function (error, data) {
                info.markdown = new Buffer(data.content, 'base64').toString();
                nextCallback(null, info);

            });
        }], callback);
};
