'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = false;
var githubAPI = require('./githubAPI.js');
var flow = require('flow');

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    var result;
    if (category !== 'demo' && category !== 'javascript' && category !== 'markup') {
        callback(new Error('Bad format'));

        return;
    }
    function extract(error, extracted) {
        if (error) {
            callback(error);
        } else {
            var template = category + '-task';
            try {
                extracted = JSON.parse(extracted);
            } catch (exception) {
                callback(error);

                return;
            }
            result = extracted
                .filter(function (task) {
                    return task.name.indexOf(template) === 0;
                })
                .map(function (repository) {
                    var note = {
                        'name': repository.name,
                        'description': repository.description
                    };

                    return note;
                });
            callback(error, result);
        }
    }
    githubAPI.getList(extract);
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
                githubAPI.getRepository(task, repCallb.bind(null, next, callback));
            },
            function (item, next) {
                githubAPI.getReadMe(task, readMeInfoCallb.bind(null, next, item));
            }
        ],
        callback
    );
};

function repCallb(next, callback, err, data) {
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

function readMeInfoCallb(next, item, err, response) {
    if (err) {
        next(err);
        console.info(1);

        return;
    }

    try {
        response = JSON.parse(response);
    } catch (e) {
        next(e);
        console.info(1);

        return;
    }

    console.info(1);

    githubAPI.downloadReadMe(
        response.download_url,
        readmeLoadFileCallback.bind(null, next, item)
    );
}

function readmeLoadFileCallback(next, item, err, response) {
    if (err) {
        next(err);
        console.info(1);
    } else {
        item.markdown = response;
        console.info(1);
        next(null, item);
    }
}
