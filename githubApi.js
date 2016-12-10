'use strict';

var fs = require('fs');
var request = require('./request');
var flow = require('flow');

var TOKEN = '';
try {
    TOKEN = fs.readFileSync('token.txt', 'ascii').trim();
} catch (e) {
    console.info(e.message);
}
function getOptions(orgPath) {
    return {
        host: 'api.github.com',
        path: orgPath,
        headers:
        {
            'Authorization': 'Bearer ' + TOKEN,
            'User-Agent': 'Github README reader by Mozalov Pavel'
        }
    };
}

exports.getRepos = function (org, callback) {
    var orgPath = '/orgs/' + org + '/repos';
    var getRequest = request.get.bind(null, getOptions(orgPath));
    flow.serial([getRequest, flow.makeAsync(JSON.parse)], callback);
};

exports.getRepo = function (owner, repo, callback) {
    var orgPath = '/repos/' + owner + '/' + repo;
    var getRequest = request.get.bind(null, getOptions(orgPath));
    flow.serial([getRequest, flow.makeAsync(JSON.parse)], callback);
};

exports.getMarkdown = function (owner, repo, callback) {
    var orgPath = '/repos/' + owner + '/' + repo + '/readme';
    function contentDecode(data) {
        return new Buffer(data.content, 'base64').toString('utf-8');
    }
    var getRequest = request.get.bind(null, getOptions(orgPath));
    flow.serial([getRequest, flow.makeAsync(JSON.parse), flow.makeAsync(contentDecode)], callback);
};

exports.renderMarkdown = function (markdown, callback) {
    var options = getOptions('/markdown/raw');
    options.headers['Content-Type'] = 'text/plain';
    request.post(options, markdown, callback);
};
