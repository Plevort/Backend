// socket.js
const { Server } = require('socket.io');

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*', 
            methods: ['GET', 'POST'],
            credentials: true,
        }
    });

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('message', (data) => {
            console.log(`Message from ${socket.id}: ${data}`);
            io.emit('message', data);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

module.exports = initializeSocket;
