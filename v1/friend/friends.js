const User = require('../../schemas/user.js');
const verifyToken = require('../../middleware/verify.js');

async function FriendsRoute(fastify, options) {
    const io = options.io; // Access to Socket.IO instance

    // HTTP route to get the friends list of the authenticated user
    fastify.get('/v1/friend/friends', { preHandler: verifyToken }, async function (request, reply) {
        try {
            // Find the user by the uniqueId from the JWT token
            const user = await User.findOne({ uniqueId: request.user.uniqueId }).select('friends').lean();

            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            // Fetch details of all the friends
            const friends = await User.find({ uniqueId: { $in: user.friends } }).select('uniqueId username displayName').lean();

            return reply.code(200).send(friends);
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Error fetching friends list' });
        }
    });

    // WebSocket event listeners
    io.on('connection', (socket) => {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];

        try {
            // Verify token and attach user info to the socket
            const decoded = verifyToken({ headers: { authorization: `Bearer ${token}` } });
            socket.user = decoded;

            // Each user joins a room based on their uniqueId, allowing personalized real-time updates
            socket.join(socket.user.uniqueId);

            // Emit initial friend list when the user connects
            User.findOne({ uniqueId: socket.user.uniqueId })
                .select('friends')
                .lean()
                .then(async (user) => {
                    if (user) {
                        const friends = await User.find({ uniqueId: { $in: user.friends } }).select('uniqueId username displayName').lean();
                        socket.emit('friends list', friends); // Send initial list to the client
                    }
                });

            // Example: Notify when a user adds or removes a friend
            socket.on('friend status change', async (data) => {
                const { action, friendId } = data; // action: 'add' or 'remove'

                // Update the user friends list in the database
                const user = await User.findOne({ uniqueId: socket.user.uniqueId });
                if (!user) {
                    return;
                }

                if (action === 'add') {
                    if (!user.friends.includes(friendId)) {
                        user.friends.push(friendId);
                    }
                } else if (action === 'remove') {
                    user.friends = user.friends.filter(f => f !== friendId);
                }

                await user.save();

                // Fetch updated friends list and emit to the user
                const updatedFriends = await User.find({ uniqueId: { $in: user.friends } }).select('uniqueId username displayName').lean();
                socket.emit('friends list', updatedFriends); // Send updated list to the user

                // Optional: Emit this update to all friends' rooms (if relevant for their visibility)
                io.to(friendId).emit('friend status update', { uniqueId: socket.user.uniqueId, action });
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                fastify.log.info(`User ${socket.user.uniqueId} disconnected from friends route.`);
            });
        } catch (error) {
            fastify.log.error('Invalid token in WebSocket connection.');
            socket.disconnect(true); // Disconnect the socket if token is invalid
        }
    });
}

module.exports = FriendsRoute;
