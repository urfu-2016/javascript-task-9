'use strict';

exports.isStar = false;
//  var requestsAPI = require('./requestsAPI');

function getToken() {
    var fs = require('fs');
    var token = '';
    try {
        token = '?access_token=' + fs.readFileSync('token.txt', 'utf8');
    } catch (err) {
        console.info(1);
    }

    return token;
}

function getOptions(path) {
    return {
        protocol: 'https:',
        host: 'api.github.com',
        path: path + getToken(),
        method: 'get',
        headers: { 'user-agent': 'BratBratokBratishka' }
    };
}

function request(path, call) {
    var https = require('https');
    var opt = getOptions(path);
    var callback = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            if (response.statusCode === 200) {
                try {
                    call(undefined, JSON.parse(str));
                } catch (err) {
                    call(err);
                }
            } else {
                call(new Error(response.statusMessage));
            }
        });
    };
    https.request(opt, callback).end();
}


/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    var listTasks = [];
    request('/orgs/urfu-2016/repos', function (err, data) {
        if (err) {
            callback(err);

            return;
        }
        listTasks = data.filter(function (task) {
            return task.name.indexOf(category + '-task-') >= 0;
        }).map(function (task) {
            return { 'description': task.description, 'name': task.name };
        });
        callback(undefined, listTasks);
    });
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var result = {};
    request('/repos/urfu-2016/' + task + '/readme', function (err1, data1) {
        request('/repos/urfu-2016/' + task, function (err2, data2) {
            if (err2) {
                callback(err2, undefined);

                return;
            }
            if (err1) {
                callback(err1, undefined);

                return;
            }
            result.name = data2.name;
            result.description = data2.description;
            callback(undefined, result);
        });
        try {
            result.markdown = new Buffer(data1.content, 'base64').toString('utf-8');
        } catch (err) {
            result.markdown = '';
        }
    });
};
