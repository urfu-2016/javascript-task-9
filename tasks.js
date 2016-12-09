'use strict';

var api = require('./api.js');
var flow = require('flow.js');

/**
 * Сделано задание на звездочку
 * Реализовано получение html
 */
exports.isStar = true;

var ALLOWED_CATEGORIES = ['demo', 'javascript', 'markup'];

function filterRepos(category, repos, callback) {
    var taskNameStart = category + '-task';

    callback(null, repos.reduce(function (filtered, repo) {
        if (repo.name.startsWith(taskNameStart)) {
            filtered.push({
                name: repo.name,
                description: repo.description
            });
        }

        return filtered;
    }, []));
}

/**
 * Получение списка задач
 * @param {String} category – категория задач (javascript или markup)
 * @param {Function} callback
 */
exports.getList = function (category, callback) {
    if (ALLOWED_CATEGORIES.indexOf(category) === -1) {
        callback(new Error('invalid category'));
    } else {
        flow.serial([
            api.getOrganizationRepos.bind(global, 'urfu-2016'),
            filterRepos.bind(global, category)
        ], callback);
    }
};

/**
 * Загрузка одной задачи
 * @param {String} task – идентификатор задачи
 * @param {Function} callback
 */
exports.loadOne = function (task, callback) {
    var result = {};

    flow.serial([
        api.getRepo.bind(global, 'urfu-2016', task),

        function (repo, next) {
            result.name = repo.name;
            result.description = repo.description;
            next(null);
        },

        api.getReadme.bind(global, 'urfu-2016', task),

        function (readme, next) {
            result.markdown = new Buffer(readme.content, readme.encoding).toString('utf-8');
            next(null);
        },

        function (next) {
            api.renderMarkdown(result.markdown, next);
        },

        function (renderedMarkdown, next) {
            result.html = renderedMarkdown;
            next(null, result);
        }
    ], callback);
};
