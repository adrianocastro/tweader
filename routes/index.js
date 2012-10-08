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

exports.index = function(req, res){
    // Read user’s query items

    // @TODO: read these from the user's input and previous selections (localStorage)
    if (req.body.q) {
        var submit      = req.body.submit,
            queryItems  = req.body.q.split(','),
            terms       = [],
            tweets      = [],
            opts        = {},
            queue       = [];

        queryItems = queryItems.map(function (t) { return t.trim(); });

        // var queryItems  = {
        //         topics : ['#fleetweek', '#americascup', '@bandpage', 'sf giants']
        //         // , feeds  : ['nefarioustim', 'adrianocastro', 'diff_sky']
        //     },

        // Check each topic (can be a hashtag, an @ reference or any query) to process
        if (queryItems.length > 0) {
            queryItems.forEach(function (topic) {
                queue.push(function (callback) {
                    opts.host = 'search.twitter.com',
                    opts.path = '/search.json?lang=en&rpp=5&q=' + encodeURIComponent(topic);
                    fetch(opts, callback);
                });
                terms.push({'name' : topic});
            });
        }

        // // Check each @ feed to process
        // if (items.feeds.length > 0) {
        //     items.feeds.forEach(function(feed) {
        //         queue.push(function (callback) {
        //             opts.host = 'api.twitter.com',
        //             opts.path = '/1/statuses/user_timeline.json?count=5&screen_name=' + encodeURIComponent(feed);
        //             fetch(opts, callback);
        //         });
        //         terms.push({'name' : '@' + feed});
        //     });
        // }

        // If we have a queue of topics/feeds to process run them in parallel
        if (queue.length > 0) {
            async.parallel(
                queue,
                // callback to handle the results
                function(err, results){

                    // @TODO: consider normalizing the results object for #topics vs @feeds
                    results.forEach(function (result) {
                        if (result.results) {
                            result.results.forEach(function (t) {
                                t.origin = decodeURIComponent(result.query);
                                tweets.push(t);
                            })
                        // } else {
                        //     result.forEach(function (t) {
                        //         t.origin = t.user.screen_name;
                        //         tweets.push(t);
                        //     });
                        }
                    });

                    // Sort tweets by date
                    tweets = sortTweetsByDate(tweets);

                    // if json
                    // res.send(tweets);
                    res.render('index', { title: 'Tweader', terms: terms, tweets: tweets });
                }
            );
        }
    } else {
        res.render('index', { title: 'Tweader (empty)' });
    }
};
