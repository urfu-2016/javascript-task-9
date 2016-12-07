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
            callback(err);
        }

        if (data.statusCode !== 200) {
            callback(data.statusMessage);
        }

        var parsedData;
        try {
            parsedData = JSON.parse(data.body);
        } catch (e) {
            callback(e);

            return;
        }

        var items = parsedData
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
            callback(err);
        }

        if (data.statusCode !== 200) {
            next(data.statusMessage);
        }

        var body;
        try {
            body = JSON.parse(data.body);
        } catch (e) {
            next(e);

            return;
        }

        var item = {
            name: body.name,
            description: body.description
        };

        next(null, item);
    }

    function readmeCallback(next, item, err, data) {
        function readmeLoadFileCallback(nextCallback, error, response) {
            if (error) {
                nextCallback(error);
            }

            if (response.statusCode !== 200) {
                nextCallback(response.statusMessage);
            }

            // item.markdown = response.body.replace(/\n/g, '\r\n');
            item.markdown = response.body;
            nextCallback(null, item);
        }

        if (err) {
            next(err);
        }

        if (data.statusCode !== 200) {
            next(data.statusMessage);
        }

        var body;
        try {
            body = JSON.parse(data.body);
        } catch (e) {
            next(e);

            return;
        }

        githubAPI.readmeLoadFile(body.download_url, readmeLoadFileCallback.bind(null, next));
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
