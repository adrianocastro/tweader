// Create a global instance of socket.io.
// This will make it possible to use it across the app including in the routes
var io = require('socket.io'),
    ioListen;

exports.init = function(server){
    ioListen = io.listen(server);

    ioListen.sockets.on('connection', function (socket) {
        socket.emit('connection-on', { status: 'Connection is on.' });
    });
    ioListen.sockets.on('disconnect', function (socket) {
        socket.emit('user-disconnected', { status: 'User disconnected.' });
    });
}

// Expose the socket.io listener
exports.sio = function() {
    return ioListen;
}
