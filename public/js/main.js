// // @TODO: namespace
// $(function(){

//     // This will talk to socket.io
//     var socket = io.connect('http://localhost:3000');

//     socket.on('feed-update', function (data) {
//         // Pass data to function to render new items into the feed
//     });
//     socket.on('newtweet', function (data) {
//         console.log('we got new tweets', data);
//     });

//     // Handle topic search form interactions
//     $('#topic-search').submit(function(e) {
//         // Prevent the form submit
//         e.preventDefault();
//         // Temporarily disable the submit button until the ajax call is complete
//         var submitButton = $('input[type=submit]', this);
//         submitButton.attr('disabled', 'disabled');

//         $.ajax({
//             url: "/.json",
//             data: $(this).serialize(),
//             success: function(data) {
//                 console.log('data', data);
//             }
//         }).done(function() {
//             // Re-enable the submit button
//             submitButton.removeAttr('disabled');
//         });
//     });

//     function addToFeed(tweets) {
//         // add new tweets to existing feed
//     }

//     function addToTopicList(topics) {
//         // add new topics to topic list
//     }

//     function removeFromTopicList(topics) {
//         // remove topics from topic list
//     }
// });