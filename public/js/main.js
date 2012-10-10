// @TODO: namespace
$(function(){

    // // This will talk to socket.io
    // var socket = io.connect('http://localhost:3000');

    // socket.on('feed-update', function (data) {
    //     // Pass data to function to render new items into the feed
    // });
    // socket.on('newtweet', function (data) {
    //     console.log('we got new tweets', data);
    // });

    // Handle topic search form interactions
    $('#topic-search').submit(function(e) {
        // Prevent the form submit
        e.preventDefault();
        // Temporarily disable the submit button until the ajax call is complete
        var submitButton = $('input[type=submit]', this),
            query        = $('#q', this);

        // @TODO: validate for duplicate queries too besides empty string validation.
        if ($.trim(query.val()) !== '') {
            submitButton.attr('disabled', 'disabled');

            $.ajax({
                url: "/.json",
                data: $(this).serialize(),
                success: function(data) {
                    console.log('data', data);
                    var existingFeed = $('#feed').html();
                    var existingTerms = $('#topic-list').html();

                    dust.render('tweader.feed', { tweets : data.tweets }, function (err, output) {
                        $('#feed').html(output + existingFeed);
                    });
                    dust.render('tweader.terms', { terms : data.terms }, function (err, output) {
                        $('#topic-list').html(output + existingTerms);
                    });
                }
            }).done(function() {
                // Re-enable the submit button and clear the old query
                submitButton.removeAttr('disabled');
                query.val('');
            });
        } else {
            alert('Please enter a non-empty query.');
        }
    });

    // Handle topic removing
    $("#topic-list").on("click", ".topic-remove", function(e){
        e.preventDefault();

        var topic       = $(this).parent(),
            topicId     = topic.attr('data-id'),
            topicTweets = $('#feed').find("[data-id='" + topicId + "']"),
            savedTopics = $('#savedTerms');

        // remove all tweets for topic from the feed
        topicTweets.remove();
        // remove topic itself from topic list
        topic.remove();
        // and remove topic from list of saved topics
        savedTopics.val(savedTopics.val().replace(topicId + ',', ''));
    });
});