// /socket.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./schemas/user');
function initializeSocket(server) {
    const io = socketIO(server);
    let connectedUsersCount = 0;
    const connectedUsers = {}; 

    io.on('connection', (socket) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            console.log('Disconnected: No token provided');
            return socket.disconnect(); 
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.log('Disconnected: Invalid token');
                return socket.disconnect();
            }

            try {
                const user = await User.findOne({ uniqueId: decoded.uniqueId });
                if (!user) {
                    console.log('Disconnected: User not found');
                    return socket.disconnect(); 
                }

                socket.user = { uniqueId: user.uniqueId, displayName: user.displayName };
                socket.join(user.uniqueId);
                
                connectedUsers[user.uniqueId] = socket.id;
                connectedUsersCount++;
                console.log(`User ${user.displayName} (ID: ${user.uniqueId}) authenticated. Total connected users: ${connectedUsersCount}`);
            } catch (dbError) {
                console.error('Database error:', dbError);
                return socket.disconnect(); 
            }
        });

        socket.on('disconnect', () => {
            if (socket.user && connectedUsers[socket.user.uniqueId]) {
                delete connectedUsers[socket.user.uniqueId];
                connectedUsersCount--;
                console.log(`User ${socket.user.displayName} (ID: ${socket.user.uniqueId}) disconnected. Total connected users: ${connectedUsersCount}`);
            } else {
                console.log('A user disconnected without a valid session.');
            }
        });
    });
/*
    const sendMessageToUser = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('message', message);
            console.log(`Sent message to ${userId}: ${message}`);
        } else {
            console.log(`User ${userId} is not connected.`);
        }
    };

    const sendMessageToUsers = (userIds, message) => {
        userIds.forEach(userId => {
            const socketId = connectedUsers[userId];
            if (socketId) {
                io.to(socketId).emit('message', message);
                console.log(`Sent message to ${userId}: ${message}`);
            } else {
                console.log(`User ${userId} is not connected.`);
            }
        });
    };

const { io, sendMessageToUsers } = initializeSocket(server);

const userIds = ['userUniqueId1', 'userUniqueId2', 'userUniqueId3'];
sendMessageToUsers(userIds, 'Hello everyone!');

 return { io, sendMessageToUser, sendMessageToUsers };

*/

    return { io };
}

module.exports = initializeSocket;
