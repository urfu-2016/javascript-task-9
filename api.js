'use strict';

var fs = require('fs');
var path = require('path');
var request = require('request');
var flow = require('flow');
var GITHUB_URL = 'https://api.github.com';
var USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:37.0) Gecko/20100101 Firefox/37.0';

/**
 * Пробуем распарсить сына Джея
 * @param {String} json - сын Джея
 * @param {Function} callback
 * @param {Function} filter - если нужно отфильтровать
 */
function tryParse(json, callback, filter) {
    try {
        var parsed = JSON.parse(json);
        callback(null, filter ? parsed.filter(filter) : parsed);
    } catch (e) {
        callback(e);
    }
}

/**
 * Создаем строку запроса к апи
 * Нету шаблонных строк - костыляем как можем
 * @param {Array<String>} pathParts - части запроса
 * @returns {String} - запрос
 */
function makeQuery(pathParts) {
    return pathParts.reduce(function (query, part) {
        return query + '/' + part;
    }, GITHUB_URL);
}

/**
 * GET запрос
 * @param {String} url
 * @param {Function} callback
 * @param {Function} filter - если нужно фильтровать
 */
function makeRequest(url, callback, filter) {
    var options = {
        url: url,
        headers: { 'User-Agent': USER_AGENT }
    };
    request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            callback(error || new Error('Bad response'));
        } else {
            tryParse(body, callback, filter);
        }
    });
}

/**
 * Обертка для работы с api GitHub'а
 * @param {String} organisation
 * @param {String} tokenFileName - файл с токеном
 * @constructor
 */
function GithubRepositoriesAPI(organisation, tokenFileName) {
    var token = '';
    try {
        token = fs.readFileSync(path.join(__dirname, tokenFileName), 'utf-8').slice(0, -1);
    } catch (e) {
        console.warn('Token file doesn\'t exist');
    }
    var auth = token ? '?access_token=' + token : '';

    this.getTaskById = function (task, callback) {
        var query = makeQuery(['repos', organisation, task]) + auth;
        makeRequest(query, callback);
    };

    this.getReadmeById = function (task, callback) {
        var query = makeQuery(['repos', organisation, task, 'readme']) + auth;
        makeRequest(query, function (error, data) {
            if (error) {
                callback(error);
            } else {
                var buffer = new Buffer(data.content, data.encoding);
                callback(null, buffer.toString('utf-8'));
            }
        });
    };

    this.renderMarkdown = function (markdownText, callback) {
        var options = {
            method: 'POST',
            url: GITHUB_URL + '/markdown/raw',
            body: markdownText,
            headers: {
                'User-Agent': USER_AGENT,
                'Content-Length': Buffer.byteLength(markdownText),
                'Content-Type': 'text/plain'
            }
        };
        request(options, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                callback(error || new Error('Bad response'));
            } else {
                callback(null, body);
            }
        });
    };

    this.getFullInfoById = function (task, callback) {
        var result = {};
        var _this = this;
        flow.serial([
            this.getTaskById.bind(global, task),

            function (repo, next) {
                result.name = repo.name;
                result.description = repo.description;
                next(null);
            },

            this.getReadmeById.bind(global, task),

            function (readme, next) {
                result.markdown = readme;
                next(null);
            },

            function (next) {
                _this.renderMarkdown(result.markdown, next);
            },

            function (renderedMarkdown, next) {
                result.html = renderedMarkdown;
                next(null, result);
            }
        ], callback);
    };

    this.getAllByCategory = function (category, callback) {
        var query = makeQuery(['orgs', organisation, 'repos']) + auth;
        makeRequest(query, callback, function (task) {
            return task.name.lastIndexOf(category + '-task') === 0;
        });
    };
}

module.exports = GithubRepositoriesAPI;
