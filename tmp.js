https.request('GET', 'https://api.github.com/zen',
    {
        'Authorization': 'Basic '
    }
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
