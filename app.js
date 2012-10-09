var express       = require('express')
    , routes      = require('./routes')
    , http        = require('http')
    , path        = require('path')
    // Using socket.io for real-time
    , socketio    = require('socket.io')
    // , connect     = require('express/node_modules/connect')
    // // Need cookies and memorystore to help with locking the socket.io session
    // , parseCookie = connect.utils.parseSignedCookie
    // , MemoryStore = connect.middleware.session.MemoryStore
    // , store
    // Using dust for templating
    , dust        = require('dustjs-linkedin')
    , kleiDust    = require('klei-dust');

// Create a new Express app
var app = express();

// Default app configs
app.configure(function(){
    app.set('port', process.env.PORT || 3000);

    // View settings
    kleiDust.setOptions({root: __dirname + '/views', extension: 'dust', cache: false});
    app.engine('dust', kleiDust.dust);
    app.set('view engine', 'dust');
    app.set('views', __dirname + '/views');

    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // app.use(express.cookieParser());
    // app.use(express.session({
    //     secret: 'secret'
    //     , key: 'express.sid'
    //     , store: store = new MemoryStore()
    // }));

    app.use(app.router);

    app.use(express.static(path.join(__dirname, 'public')));
});

// Dev app configs
app.configure('development', function(){
    app.use(express.errorHandler());
});

// Create a server instance and start listening
var server = http.createServer(app);

server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

// Tell socket.io to listen to our server instance
var io = socketio.listen(server);

// io.set('authorization', function (data, accept) {
//     if (!data.headers.cookie) {
//         return accept('No cookie transmitted.', false);
//     }

//     data.cookie    = parseCookie(data.headers.cookie);
//     console.log('data.cookie', data.cookie);
//     data.sessionID = data.cookie['express.sid'];
//     console.log('data.sessionID', data.sessionID);

//     store.load(data.sessionID, function (err, session) {
//         console.log('err', err);
//         console.log('session', session);
//         if (err || !session) {
//             return accept('Error', false);
//         }

//         data.session = session;
//         return accept(null, true);
//     });
// });

io.sockets.on('connection', function (socket) {

    var tweets = setTimeout(function () {
        socket.emit('newtweet', { foo: 'bar' });

    }, 5000);

    // var sess = socket.handshake.session;
    // socket.log.info(
    //     'a socket with sessionID'
    //     , socket.handshake.sessionID
    //     , 'connected'
    // );
    // socket.on('set value', function (val) {
    //     sess.reload(function () {
    //         sess.value = val;
    //         sess.touch().save();
    //     });
    // });
});

// Set up routes
app.get('/', routes.index);
app.post('/', routes.index);
app.get('/.:json?', routes.index);
