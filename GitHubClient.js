'use strict';


var http = require('http');

var BASE_URL = 'https://github.com/urfu-2016';

function GitHubClient(username, token) {
    this.username = username;
    this.token = token;
}

exports.getRepos = function (category) {
    http.get(BASE_URL + category)
}