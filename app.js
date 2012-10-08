var express    = require('express')
    , routes   = require('./routes')
    , http     = require('http')
    , path     = require('path')
    , dust     = require('dustjs-linkedin')
    , kleiDust = require('klei-dust')
    , hbs      = require('hbs');

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);

    kleiDust.setOptions({root: __dirname + '/views', extension: 'dust', cache: false});
    app.engine('dust', kleiDust.dust);
    app.set('view engine', 'dust');
    app.set('views', __dirname + '/views');

    // app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(app.router);

    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

// app.get('/?.json', routes.index);
app.get('/', routes.index);
app.post('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
