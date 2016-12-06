var https = require('https');
var fs = require('fs');

var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/zen',
    method: 'GET',
    headers: {
        'Authorization': 'Basic ' + new Buffer(':' + fs.readFileSync('token.txt')).toString('base64'),
        'User-Agent': 'Gallyam repo browser'
    }
};

var req = https.request(options,
    function (res) {
        console.log(res.statusCode);
        var content = '';
        res.on('data', function (chunk) {
            content += chunk;
        });
        res.on('end', function () {
            console.log('Content: ' + content);
        });
    }).on('error', function (err) {
        console.log('Error: ' + err);
    });

req.end();
