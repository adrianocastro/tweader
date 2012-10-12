# Tweader

## Description

A very simple Twitter reader. Provides the user with a way to query a number of different topics and shows a self-updating real-time unified feed for the selected topics.

This app runs on node.js using Express and the dust templating engine. For the real-time piece it uses socket.io. On the server side a call to the twitter feed runs at an interval and every time new data comes through, an event is published via socket.io to the listening client. Upon receiving this new data the client adds it to the feed.

For no-JS fallback the page refreshes for every query but keeps the list of previously saved queries in an empty input field.

## Installation

1. `npm clone https://github.com/adrianocastro/tweader.git`
1. `cd tweader`
1. `npm install`
1. `node app.js`
1. open `http://localhost:3000` on your browser

## Brief

Build a node.js based app that makes it possible for a user to look up topics on Twitter (via the Twitter API) and have them displayed on the browser in real-time. The user is able to add multiple queries but also remove them. Multiple feeds are merged inline, not split into two separate timelines.

No major constraints on the choice of technology but anything too magical should be avoided.

Aim for modularity, maintainability and readability.

## Notes

This app runs on Express on top of node.js. It uses the [dust templating engine](http://linkedin.github.com/dustjs) and shares the templates on the client via [dustbuster](https://github.com/diffsky/dustbuster/). For real-time communication it uses [Socket.io](http://socket.io/). Additionally, [Async](https://github.com/caolan/async) is used as a helper utility.

Most of the time spent on building this was around familiarising myself with Socket.io and learning how to best integrate it with Express. Figuring out the best way to share templates between the server and the client was also a key concern and, after some investigating, I chose to go with dust/dustbuster. Lastly, understanding the ins and outs of the Twitter API was also necessary for making this work.

My original approach (please refer to the first commits against this repository) was aiming to have an app that worked fully without any client side JavaScript and then building on top of that. Though I managed to get this working (without real-time, obviously), keeping the original approach started to take too much time as I built up the full rich, one-page interaction. It should be perfectly doable and the app has mostly all it needs for it to happen but it needed more time and I was trying to get to a point where it fit a minimum set of requirements from the brief.

## TODO

- use sessions to support multiple users
- better error handling
- handle user disconnect by cleaning up after he’s left the building
- better namespacing

## References

- Twitter Search REST API
    - https://dev.twitter.com/docs/api/1/get/search
    - e.g. http://search.twitter.com/search.json?q=mtdiablo
- Twitter Timeline REST API
    - e.g. http://api.twitter.com/1/statuses/user_timeline.json?user_id=adrianocastro
- Express
    - http://expressjs.com/
- Socket.io
    - http://socket.io/
    - https://github.com/LearnBoost/socket.io/wiki/Exposed-events
- Dust
    - http://linkedin.github.com/dustjs/
    - http://akdubya.github.com/dustjs/
    - https://github.com/diffsky/dustbuster/
- Async
    - https://github.com/caolan/async