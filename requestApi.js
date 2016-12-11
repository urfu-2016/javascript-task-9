'use strict';

var request = require('request');

function createOptions(url) {
    return {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ABrowse 0.4; Syllable)'
        }
    };
}

function getAllRepos(callback) {
    var options = createOptions('https://api.github.com/orgs/urfu-2016/repos');
    request(options, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            callback(err || new Error('wrongs statusCode'));
        } else {
            callback(null, JSON.parse(body).map(function (repo) {
                return { name: repo.name, description: repo.description };
            }));
        }
    });
}

exports.getReposByCategory = function (category, callback) {
    getAllRepos(function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, data.filter(function (repo) {
                return repo.name.indexOf(category + '-task') !== -1;
            }));
        }
    });
};

exports.getOneRepo = function (name, callback) {
    var options = createOptions('https://api.github.com/repos/urfu-2016/' + name);
    request(options, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            callback(err || new Error('wrongs statusCode'));
        } else {
            var parsed = JSON.parse(body);
            callback(null, { name: parsed.name, description: parsed.description });
        }
    });
};


exports.getRepoMarkdown = function (name, callback) {
    var options = createOptions('https://api.github.com/repos/urfu-2016/' + name + '/readme');
    request(options, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            callback(err || new Error('wrongs statusCode'));
        } else {
            var parsed = JSON.parse(body);
            var buffer = new Buffer(parsed.content, parsed.encoding);
            callback(null, { markdown: buffer.toString('utf-8') });
        }
    });
};

exports.getRepoHtml = function (text, callback) {
    var options = createOptions('https://api.github.com/markdown/raw');
    options.headers.contentType = 'text/plain';
    options.body = text;
    options.headers.contentLength = Buffer.byteLength(text);
    request.post(options, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            callback(err || new Error('wrongs statusCode'));
        } else {
            callback(null, body);
        }
    });
};
