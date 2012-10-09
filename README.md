# Tweader

## Description

A very simple Twitter reader. Provides the user with a way to query a number of different topics and shows a self-updating real-time unified feed for the selected topics.

This app runs on node.js using Express and the dust templating engine. For the real-time piece it uses socket.io. On the server side a call to the twitter feed runs at an interval and every time new data comes through, an event is published via socket.io to the listening client. Upon receiving this new data the client adds it to the feed.

For no-JS fallback the page refreshes for every query but keeps the list of previously saved queries in an empty input field.

## Installation

1. npm clone this repository
1. cd to the clone dir
1. npm install
1. node app.js
1. http://localhost:3000

## Brief

Build a twitter feed reader following these specifications and guidelines:

Server/NodeJS: lookup Twitter feeds or topics via  Twitter API and display them in the frontend in real-time. Should be able to retain the state of the users requests in memory, i.e. if the user adds one feed, then another, the two feeds should be stored so the user can subsequently switch between them. Multiple feeds or topics are merged inline, not split in to two separate timelines.

Client: option to look up new feeds or topics and receive updates in real time. Should be able to add and remove feeds up watch updates in real time.

## Constraints

You are free to use any library of your choice.  It must, however, be chosen as if an entire team of engineers are asked to maintain it long term (so we strongly recommend not using anything too magical).

## Evaluation

The solution and design decisions will be graded on modularity, maintainability and readability.

## Notes

- Twitter Search REST API
    - https://dev.twitter.com/docs/api/1/get/search
    - http://search.twitter.com/search.json?q=mtdiablo
- Twitter Timeline REST API
    - http://api.twitter.com/1/statuses/user_timeline.json?user_id=adrianocastro
