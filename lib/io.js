exports.fetch = function(opts, cb) {
    var http = require('http'),
        req  = http.request(opts, function (res) {
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                data = JSON.parse(data);
                cb(null, data);
            });
        });

    req.on('error', function (e) {
        console.log(e.message);
    });

    req.end();
};
