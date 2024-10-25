// /socket.js
const { Server } = require('socket.io');

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('joinChat', (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.id} joined chat: ${chatId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}

module.exports = initializeSocket;
