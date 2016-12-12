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

            return;
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
    flow.serial(
        [
            function (next) {
                githubAPI.getRepository(task, repositoryCallback.bind(null, next, callback));
            },
            function (item, next) {
                githubAPI.getReadmeInfo(task, readmeInfoCallback.bind(null, next, item));
            }
        ],
        callback
    );
};

function repositoryCallback(next, callback, err, data) {
    if (err) {
        callback(err);

        return;
    }

    try {
        data = JSON.parse(data);
    } catch (e) {
        next(e);

        return;
    }

    next(null, {
        name: data.name,
        description: data.description
    });
}

function readmeInfoCallback(next, item, err, response) {
    if (err) {
        next(err);

        return;
    }

    try {
        response = JSON.parse(response);
    } catch (e) {
        next(e);

        return;
    }

    githubAPI.getReadmeFile(
        response.download_url,
        readmeLoadFileCallback.bind(null, next, item)
    );
}

function readmeLoadFileCallback(next, item, err, response) {
    if (err) {
        next(err);
    } else {
        // item.markdown = response.replace(/\n/g, '\r\n');
        item.markdown = response;
        githubAPI.getReadmeHtml(item.markdown, htmlReadmeCallback.bind(null, next, item));
    }
}

function htmlReadmeCallback(next, item, err, response) {
    if (err) {
        next(err);
    } else {
        item.html = response;
        next(null, item);
    }
}
