// /v1/friend/incoming.js
const FriendRequest = require('../../schemas/friendRequest.js');
const verifyToken = require('../../middleware/verify.js'); 

async function IncomingFriendRequestsRoute(fastify, options) {
    const io = options.io; 

    // HTTP route to get incoming friend requests
    fastify.get('/v1/friend/incoming', { preHandler: verifyToken }, async function (request, reply) {
        const userId = request.user.uniqueId;

        try {
            const incomingRequests = await FriendRequest.find({
                requested: userId,
                status: 'pending'
            });

            return reply.code(200).send(incomingRequests);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });

    // WebSocket connection handling
    io.on('connection', (socket) => {
        fastify.log.info('A user connected via socket');

        // Each user joins a room based on their unique ID
        socket.on('join', ({ userId }) => {
            socket.join(userId);  // Join a room named after the user's unique ID
            fastify.log.info(`User ${userId} joined room ${userId}`);
        });

        // Handle sending friend requests
        socket.on('send friend request', async ({ requesterId, requestedId }) => {
            try {
                const newRequest = new FriendRequest({
                    _id: Date.now(), // Unique ID for the request
                    requester: requesterId,
                    requested: requestedId,
                    status: 'pending',
                });

                await newRequest.save();

                // Emit to the requested user's room
                io.to(requestedId).emit('incoming friend request', {
                    requesterId: requesterId,
                    requestedId: requestedId,
                });

                fastify.log.info(`Friend request sent from ${requesterId} to ${requestedId}`);
            } catch (error) {
                fastify.log.error('Error sending friend request:', error);
            }
        });

        // Handle socket disconnection
        socket.on('disconnect', () => {
            fastify.log.info('User disconnected from socket');
        });
    });
}

module.exports = IncomingFriendRequestsRoute;
