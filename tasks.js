'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = false;

function checkData(data) {
    if (JSON.parse(data).message === 'Not Found') {
        throw new Error('Incorrect Repository');
    }
}

function getRepositoryInfo(path, handleData, callback) {
    var gitapi = require('./gitapi');
    gitapi.repositoryRequest(path, function (err, data) {
        if (err) {
            callback(err);
        } else {
            var handledData;
            var error;
            try {
                checkData(data);
                handledData = handleData(data);
            } catch (handleError) {
                error = handleError;
            }
            callback(error, handledData);
        }
    });
}

function orgsRepositoriesHandle(repositoryProps, category) {
    return function (data) {
        var parsedData = JSON.parse(data).map(function (record) {
            var newRecord = {};
            repositoryProps.forEach(function (property) {
                newRecord[property] = record[property];
            });

            return newRecord;
        });

        return parsedData.filter(function (record) {
            return record.name.indexOf(category) !== -1;
        });
    };
}

function readmeInfoHandle() {
    return function (data) {
        var parsedData = JSON.parse(data);
        var content = new Buffer(parsedData.content, 'base64')
            .toString('utf8');

        return { name: 'markdown', value: content };
    };
}

function repositoryInfoHandle(repositoryProps) {
    return function (data) {
        var newRecord = {};
        var record = JSON.parse(data);
        repositoryProps.forEach(function (property) {
            newRecord[property] = record[property];
        });

        return newRecord;
    };
}

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    var taskCategory = category + '-task';
    var path = '/orgs/urfu-2016/repos';
    getRepositoryInfo(path,
        orgsRepositoriesHandle(['name', 'description'], taskCategory),
        callback);
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var flow = require('./flow');
    flow.serial([
        function (next) {
            var path = '/repos/urfu-2016/' + task;
            getRepositoryInfo(path,
                repositoryInfoHandle(['name', 'description']),
                function (err, data) {
                    if (err) {
                        next(err);
                    } else {
                        next(null, data);
                    }
                });
        },
        function (outputData, next) {
            var path = '/repos/urfu-2016/' + task + '/readme';
            getRepositoryInfo(path,
                readmeInfoHandle(),
                function (err, data) {
                    if (err) {
                        next(err);
                    } else {
                        outputData[data.name] = data.value;
                        next(null, outputData);
                    }
                });
        }
    ], callback);
};
