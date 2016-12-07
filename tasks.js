'use strict';

var flow = require('flow');
var githubAPI = require('./githubAPI.js');

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
    function responseCallback(err, data) {
        if (err) {
            callback(err, null);
        }

        if (data.statusCode !== 200) {
            callback(data.statusMessage, data);
        }

        var items = JSON.parse(data.body)
            .filter(function (item) {
                return item.name.indexOf(category + '-task') === 0;
            })
            .map(function (item) {
                return {
                    name: item.name,
                    description: item.description
                };
            });

        callback(null, items);
    }

    githubAPI.getListRequest(responseCallback);
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    function repositoryCallback(next, err, data) {
        if (err) {
            callback(err, null);
        }

        if (data.statusCode !== 200) {
            next(data.statusMessage, data);
        }

        var body = JSON.parse(data.body);

        var item = {
            name: body.name,
            description: body.description
        };

        next(null, item);
    }

    function readmeCallback(next, item, err, data) {
        if (err) {
            next(err, null);
        }

        if (data.statusCode !== 200) {
            next(data.statusMessage, data);
        }

        var body = JSON.parse(data.body);


        function readmeLoadFileCallback(error, response) {
            // item.markdown = response.body.replace(/\n/g, '\r\n');
            item.markdown = response.body;
            next(null, item);
        }

        githubAPI.readmeLoadFile(body.download_url, readmeLoadFileCallback);
    }


    flow.serial(
        [
            function (next) {
                githubAPI.repositoryRequest(task, repositoryCallback.bind(null, next));
            },
            function (item, next) {
                githubAPI.readmeRequest(task, readmeCallback.bind(null, next, item));
            }
        ],
        callback
    );
};
