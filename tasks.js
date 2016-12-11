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
    function extract(error, extracted) {
        if (error) {
            callback(error, null);
        } else {
            var template = category + '-task';
            try {
                extracted = JSON.parse(extracted);
            } catch (exception) {
                callback(exception);
            }
            result = extracted
                .filter(function (task) {
                    return task.name.indexOf(template) !== -1;
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
    console.info(category, callback);
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    flow.serial([
        function (next) {
            githubAPI.getRepository(task, function (error, extracted) {
                if (!error) {
                    try {
                        extracted = JSON.parse(extracted);
                    } catch (exception) {
                        callback(exception);
                    }
                    var note = {
                        'name': extracted.name,
                        'description': extracted.description
                    };
                    next(null, note);
                } else {
                    callback(error);
                }
            });
        },
        function (note, next) {
            githubAPI.getReadMe(task, function (error, extracted) {
                if (!error) {
                    try {
                        extracted = JSON.parse(extracted);
                    } catch (exception) {
                        next(exception);
                    }
                    var url = extracted.download_url;
                    githubAPI.downloadReadMe(url, function (internalError, markdown) {
                        if (!internalError) {
                            console.info(markdown);
                            note.markdown = markdown;
                            next(null, note);
                        } else {
                            next(internalError);
                        }
                    });
                } else {
                    next(error);
                }
            });
        }
    ], callback);
};
