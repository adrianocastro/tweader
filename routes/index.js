// @TODO: better error handling
var async = require('async');

function fetch(opts, cb) {
    var http = require('http');
    opts.port = 80;

    var req = http.request(opts, function (res) {
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
}

function sortTweetsByDate (list) {
    // Use a map for sorting to avoid overhead

    // Map and result are temporary holders
    var map    = [],
        result = [],
        i,
        length;

    // Build a map of values and positions based on the original list
    for (i=0, length = list.length; i < length; i++) {
        map.push({
            // Save the index
            index: i,
            // Save the value to sort (tweet's created_at)
            value: Date.parse(list[i].created_at)
        });
    }

    // Sort by date
    map.sort(function (date1, date2) {
        date1 = date1.value;
        date2 = date2.value;
        if (date1 < date2) return 1;
        if (date1 > date2) return -1;
        return 0;
    });

    // Copy values in right order
    for (i=0, length = map.length; i < length; i++) {
        result.push(list[map[i].index]);
    }

    // Return the sorted list
    return result;
};

exports.index = function(req, res, next, globalIo){

    // console.log('globalIo', globalIo);
    // globalIo.socket.emit('newtweet', { foo: 'from exports.index bar' });
    // io.sockets.json.send(..);

    // @TODO: read these from the user's input and previous selections (localStorage)

    // Read the user's queried topics as well as previously saved ones
    var params;

    // Figure out if it's a POST or a GET request and read the params from the correct object in req
    // @TODO: consider using req.param(name) (http://expressjs.com/api.html#req.param) instead to read q
    if (req.body.q) {
        params = req.body;
    } else if (req.params.json) {
        params = req.query;
    }

    // If the request defines either GET or POST params it's because we're trying to load new data
    if (params) {
        var queryItems  = []
            savedItems  = []
            terms       = [],
            tweets      = [],
            opts        = {},
            queue       = [];

        // if the params object as q then it's a post query
        if (params.q) {
            queryItems  = params.q.split(',');
        }

        // if the params object has savedTerms
        if (params.savedTerms) {
            savedItems  = params.savedTerms.split(',');
        }

        if (savedItems.length) {
            // Merge new query items with previously saved ones
            queryItems = queryItems.concat(savedItems);
        }

        // Check each topic (can be a hashtag, an @ reference or any query) to process
        if (queryItems.length > 0) {
            // Trim and remove empty results
            // @TODO: dedupe results
            queryItems = queryItems.map(function (item) {
                return item.trim();
            }).filter(function (item) {
                return (item !== '');
            });

            queryItems.forEach(function (topic) {
                queue.push(function (callback) {
                    opts.host = 'search.twitter.com',
                    opts.path = '/search.json?lang=en&rpp=5&q=' + encodeURIComponent(topic);
                    fetch(opts, callback);
                });
                terms.push({'name' : topic});
            });
        }

        // If we have a queue of topics/feeds to process run them in parallel
        if (queue.length > 0) {
            async.parallel(
                queue,
                // callback to handle the results
                function(err, results){
                    results.forEach(function (result) {
                        if (result.results) {
                            result.results.forEach(function (t) {
                                t.origin = decodeURIComponent(result.query);
                                tweets.push(t);
                            })
                        }
                    });

                    // Sort tweets by date
                    tweets = sortTweetsByDate(tweets);

                    if (req.params.json) {
                        res.send({ tweets: tweets, terms : terms });
                    }  else {
                        res.render('index', { title: 'Tweader', terms: terms, tweets: tweets });
                    }
                }
            );
        }
    // If there are no params defined in the request then it's a new page refresh
    } else {
        res.render('index', { title: 'Tweader (empty)' });
    }
};
