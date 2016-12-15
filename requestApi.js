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
            parseJson(body, function (error, parsed) {
                if (error) {
                    callback(error);
                } else {
                    var namesAndDescriptionsOfRepo = parsed.map(function (repo) {
                        return { name: repo.name, description: repo.description };
                    });
                    callback(null, namesAndDescriptionsOfRepo);
                }
            });
        }
    });
}

exports.getReposByCategory = function (category, callback) {
    getAllRepos(function (err, data) {
        if (err) {
            callback(err);
        } else {
            var taskRepos = data.filter(function (repo) {
                return repo.name.indexOf(category + '-task') !== -1;
            });
            callback(null, taskRepos);
        }
    });
};

exports.getOneRepo = function (name, callback) {
    var options = createOptions('https://api.github.com/repos/urfu-2016/' + name);
    request(options, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            callback(err || new Error('wrongs statusCode'));
        } else {
            parseJson(body, function (error, parsed) {
                if (error) {
                    callback(error);
                } else {
                    var repoObject = { name: parsed.name, description: parsed.description };
                    callback(null, repoObject);
                }
            });
        }
    });
};

function parseJson(body, callback) {
    try {
        var parsed = JSON.parse(body);
        callback(null, parsed);
    } catch (err) {
        callback(err);
    }
}

exports.getRepoMarkdown = function (name, callback) {
    var options = createOptions('https://api.github.com/repos/urfu-2016/' + name + '/readme');
    request(options, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            callback(err || new Error('wrongs statusCode'));
        } else {
            parseJson(body, function (error, parsed) {
                if (error) {
                    callback(error);
                } else {
                    var buffer = new Buffer(parsed.content, parsed.encoding);
                    callback(null, { markdown: buffer.toString('utf-8') });
                }
            });
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
