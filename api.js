'use strict';

var fs = require('fs');
var request = require('request');
var EventEmitter = require('events').EventEmitter;


var GITHUB_URL = 'https://api.github.com';

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
 * Обертка, для необходимой нам инфомации
 * @param {String} name
 * @param {String} description
 * @param {String} markdown
 * @param {String} html
 * @constructor
 */
function Task(name, description, markdown, html) {
    this.name = name;
    this.description = description;
    this.markdown = markdown;
    this.html = html;
}

/**
 * Обертка для работы с api GitHub'а
 * @param tokenFile - файл с токеном
 * @constructor
 */
function GithubRepositoriesAPI(organisation, tokenFile) {
    var ready = false;
    var emitter = new EventEmitter();

    emitter.on('getRepositories', function () {

    });
    this.allInfo = [];
    this.token = fs.readFileSync(tokenFile, 'utf-8');
    request('http://www.google.com', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
        }
    });


}

module.exports = GithubRepositoriesAPI;
