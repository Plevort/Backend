// /socket.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let connectedClients = 0;

function initializeSocket(server) {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        connectedClients++;
        console.log(`[${connectedClients}] Connected`);

        socket.on('authenticate', (token) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    socket.disconnect();
                    console.log('Disconnected: Invalid token');
                    return;
                }
                socket.user = { uniqueId: decoded.uniqueId, token };
                console.log(`User ${decoded.uniqueId} authenticated`);

                io.emit('user_connected', { uniqueId: decoded.uniqueId });
            });
        });

        socket.on('disconnect', () => {
            connectedClients--;
            console.log(`[${connectedClients}] Disconnected`);
        });
    });

    return io;
}

module.exports = initializeSocket;
