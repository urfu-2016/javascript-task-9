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
    function extract(error, extractedList) {
        if (error) {
            callback(error, null);
        } else {
            var template = category + '-task';
            try {
                extractedList = JSON.parse(extractedList);
            } catch (exception) {
                callback(exception);

                return;
            }
            result = extractedList
                .filter(function (task) {
                    return task.name.indexOf(template) === 0;
                })
                .map(function (repository) {
                    return {
                        name: repository.name,
                        description: repository.description
                    };
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
    flow.serial([
        function (next) {
            githubAPI.getRepository(task, function (error, extractedList) {
                if (error) {
                    callback(error);

                    return;
                }
                try {
                    extractedList = JSON.parse(extractedList);
                } catch (exception) {
                    next(exception);

                    return;
                }
                var note = {
                    name: extractedList.name,
                    description: extractedList.description
                };
                next(null, note);
            });
        },
        function (note, next) {
            githubAPI.getReadMe(task, function (error, extracted) {
                if (error) {
                    next(error);

                    return;
                }
                try {
                    extracted = JSON.parse(extracted);
                } catch (exception) {
                    next(exception);

                    return;
                }
                var url = extracted.download_url;
                githubAPI.downloadReadMe(url, function (internalError, markdown) {
                    if (internalError) {
                        next(internalError);

                        return;
                    }
                    note.markdown = markdown;
                    next(null, note);
                });
            });
        }
    ], callback);
};
