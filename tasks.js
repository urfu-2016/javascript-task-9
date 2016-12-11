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
        callback(new Error('Bad format'), null);
    }
    function extract(error, extracted) {
        if (error) {
            callback(error, null);
        } else {
            var template = category + '-task';
            extracted = JSON.parse(extracted);
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
                    extracted = JSON.parse(extracted);
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
                    extracted = JSON.parse(extracted);
                    var url = extracted.download_url;
                    githubAPI.downloadReadMe(url, function (internalError, markdown) {
                        if (!internalError) {
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
