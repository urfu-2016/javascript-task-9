/* eslint-disable no-shadow */
'use strict';

var flow = require('flow');
var githubAPI = require('./githubAPI.js');

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
    function responseCallback(err, data) {
        if (err) {
            callback(err);
        }

        try {
            data = JSON.parse(data);
        } catch (e) {
            callback(e);

            return;
        }

        var items = data
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

    githubAPI.getList(responseCallback);
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

        try {
            data = JSON.parse(data);
        } catch (e) {
            next(e);

            return;
        }

        var item = {
            name: data.name,
            description: data.description
        };

        next(null, item);
    }

    function readmeCallback(next, item, err, data) {
        if (err) {
            next(err);
        }

        try {
            data = JSON.parse(data);
        } catch (e) {
            next(e);

            return;
        }

        function readmeLoadFileCallback(next, error, response) {
            if (error) {
                next(error);
            }

            // item.markdown = response.replace(/\n/g, '\r\n');
            item.markdown = response;

            function htmlReadmeCallback(next, item, error, response) {
                if (error) {
                    next(error);
                }

                item.html = response;
                next(null, item);
            }

            githubAPI.getReadmeHtml(item.markdown, htmlReadmeCallback.bind(null, next, item));
        }

        githubAPI.getReadmeFile(data.download_url, readmeLoadFileCallback.bind(null, next));
    }


    flow.serial(
        [
            function (next) {
                githubAPI.getRepository(task, repositoryCallback.bind(null, next));
            },
            function (item, next) {
                githubAPI.getReadmeInfo(task, readmeCallback.bind(null, next, item));
            }
        ],
        callback
    );
};
