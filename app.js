var express       = require('express')
    , routes      = require('./routes')
    , http        = require('http')
    , path        = require('path')
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

    app.use(app.router);

    app.use(express.static(path.join(__dirname, 'public')));
});

// Dev app configs
app.configure('development', function(){
    app.use(express.errorHandler());
});

// Set up routes
app.get('/', routes.index);
app.post('/', routes.index);
app.get('/.:json?', routes.index);

// Setup dustbuster to compile views to be usable on the client
var dustbuster = require('dustbuster');
dustbuster({
    input: __dirname + '/views',
    basename : 'tweader',
    output: __dirname + '/public/js/dust.templates.js'
});

// Create a server instance and start listening
var server = http.createServer(app);

server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

// Initialise socket.io and tell it to listen to our server instance
var io = require('./lib/socket.io.js');
io.init(server);
