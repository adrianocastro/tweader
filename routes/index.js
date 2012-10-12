var async = require('async'),
    // list of saved terms/queries
    savedTerms = {},
    // setInterval id
    newTweetChecker,
    // API config object
    apiConfig = {
        host: 'search.twitter.com',
        port: 80,
        basePath: '/search.json',
        defaultArgs: '?lang=en&rpp=5&q='
    };

// @TODO: clean up after the user disconnects
// // Listen for user-disconnect and clean things up.
// var sio = require('../lib/socket.io.js').sio();
// sio.sockets.on('user-disconnected', function () {
//     console.log('User disconnected. Cleaning up.');
//     clearInterval(newTweetChecker);
//     savedTerms = null;
// });

var handlePageRequest = function (req, res) {
    var params;

    // Figure out if it's a POST or a GET request and read the params from the correct object in req
    // @TODO: consider using req.param(name) (http://expressjs.com/api.html#req.param) instead to read q
    if (req.body.q) {
        params = req.body;
    } else if (req.params.json) {
        params = req.query;
    }

    // Request to remove a previously selected query
    if (params && params.remove) {
        delete(savedTerms[params.remove]);
        if (Object.getOwnPropertyNames(savedTerms).length < 1) {
            clearInterval(newTweetChecker);
        }
    }

    // If the request defines either GET or POST params it's because we're trying to load new data
    if (params) {
        var queryItem = '',
            terms     = [],
            tweets    = [],
            queue     = [];

        // if the params object has q then it's a post query
        if (params.q) {
            queryItem  = params.q.trim();
        }

        // Save the query name under terms to be used to render on the view
        terms.push({'name' : queryItem});
        var isJson = true;

        // Fetch tweets
        fetchTweets(queryItem, function sendPayload(tweets) {
            console.log('sendPayload()');
            console.log('sendPayload(): tweets', tweets);
            // If JSON call prepare to send JSON
            if (req.params.json) {
                // Send data over to client
                res.send({ tweets: tweets, terms : terms });
                // Create a listener to check for new tweets
                checkForNewTweets();
            }  else {
                res.render('index', { title: 'Tweader', terms: terms, tweets: tweets });
            }
        });

        // Save to the list of saved terms if not a dup
        if (!savedTerms[queryItem]) {
            savedTerms[queryItem] = {}
        }

    } else {
        // If there are no params defined in the request then it's a new page refresh
        res.render('index', { title: 'Tweader' });
    }

};

var fetchTweets = function (queryItem, cb) {
    console.log('fetchTweets()');

    var io = require('../lib/io.js'),
        queue  = [],
        tweets = [],
        termsToProcess = {};

    if (queryItem) {
        termsToProcess[queryItem] = {};
    } else {
        termsToProcess = savedTerms;
    }

    console.log('termsToProcess', termsToProcess);

    for (var term in termsToProcess) {
        if (termsToProcess.hasOwnProperty(term)) {
            var queryPath = apiConfig.basePath + apiConfig.defaultArgs + encodeURIComponent(term);
            if (!queryItem && termsToProcess[term].refreshUrl) {
                queryPath = apiConfig.basePath + termsToProcess[term].refreshUrl;
            }

            queue.push((function(queryPath) {
                return function (callback) {
                    apiConfig.path = queryPath;
                    io.fetch(apiConfig, callback);
                }
            })(queryPath));
        }
    }

    if (queue.length > 0) {
        async.parallel(
            queue,
            // Callback to handle the results
            function handleResults (err, results){
                results.forEach(function (result) {
                    var term = decodeURIComponent(result.query);

                    if (result.results.length > 0) {
                        result.results.forEach(function (t) {
                            t.origin = term;
                            tweets.push(t);
                        })
                        console.log('New tweets have been found.');
                    } else {
                        console.log('No results found.');
                        return false;
                    }

                    // Sort tweets by date
                    tweets = sortTweetsByDate(tweets);

                    // Store the id of the latest tweet
                    if (!savedTerms[term]) {
                        savedTerms[term] = {};
                    }
                    savedTerms[term].latestId   = tweets[0].id_str;
                    savedTerms[term].refreshUrl = result.refresh_url
                });

                // Perform callback
                cb(tweets);
            }
        );
    }
};

var sortTweetsByDate = function (list) {
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

var checkForNewTweets = function () {
    console.log('checkForNewTweets()');
    var sio = require('../lib/socket.io.js').sio();

    // Clear any previously existing intervals
    clearInterval(newTweetChecker);
    // Set a new interval listener for new tweets
    newTweetChecker = setInterval(function() {
        fetchTweets(null, function emitNewTweetsEvent(tweets) {
            if (tweets.length > 0) {
                sio.sockets.emit('new-tweets', { status: 'New tweets are in.', tweets: tweets });
            }
        });
    }, 10000);
}


// Exports
exports.index = handlePageRequest;
