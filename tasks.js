'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */

var github = require('./github');
var flow = require('flow');
exports.isStar = true;

var JS_TEMPLATE = /javascript-task-\d+/;
var MARKUP_TEMPLATE = /markup-task-\d+/;
var DEMO_TEMPLATE = /demo-task-\d+/;

function getTemplate(category) {
    if (category === 'javascript') {

        return JS_TEMPLATE;
    }
    if (category === 'markup') {

        return MARKUP_TEMPLATE;
    }
    if (category === 'demo') {

        return DEMO_TEMPLATE;
    }

    throw new Error('Wrong category');
}

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    var template = getTemplate(category);
    github.repoList(function (err, res) {
        if (!err) {
            var tasks = [];
            res.forEach(function (repo) {
                if (repo.name.match(template)) {
                    tasks.push({
                        'name': repo.name,
                        'description': repo.description
                    });
                }
            });
            callback(err, tasks);
        } else {
            callback(err, null);
        }
    });
};

function addData(func, task, fields, addFields) {
    if (!addFields) {
        addFields = fields;
    }

    return function (data, callback) {
        func(task, function (err, jsonResponse) {
            if (err) {
                callback(err, null);

                return;
            }
            for (var i = 0; i < fields.length; i++) {
                data[addFields[i]] = jsonResponse[fields[i]];
            }
            callback(null, data);
        });
    };
}

function contentToMarkdown(data, callback) {
    data.markdown = new Buffer(data.content, data.encoding).toString('utf-8');
    delete data.content;
    delete data.encoding;
    callback(null, data);
}


function addHTMLMarkdown(data, callback) {
    github.markdownToHTML(data.markdown, function (err, res) {
        if (err) {
            callback(err, null);
        }
        data.html = res;
        callback(null, data);
    });
}

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var repoData = { 'name': task };
    flow.serial([
        addData(github.repoInfo, task, ['name', 'description']).bind(null, repoData),
        addData(github.repoInfo, task + '/readme', ['content', 'encoding']),
        contentToMarkdown,
        addHTMLMarkdown

    ], function (err, data) {
        callback(err, data);
    });
};
