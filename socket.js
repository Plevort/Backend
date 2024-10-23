// /socket.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Chat = require('./schemas/chat'); // Adjust path as necessary

function initializeSocket(server) {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('authenticate', (token) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    socket.disconnect();
                    console.log('Disconnected: Invalid token');
                    return;
                }
                socket.user = { uniqueId: decoded.uniqueId };
                console.log(`User ${decoded.uniqueId} authenticated`);
                
                // Listen for changes in chat
                Chat.watch().on('change', (change) => {
                    // Emit an event to the user or to all connected clients
                    io.to(socket.user.uniqueId).emit('chat_update', change); // or io.to(socket.user.uniqueId).emit('chat_update', change);
                });
            });
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

    return io; // Return the initialized Socket.IO instance
}

module.exports = initializeSocket;
