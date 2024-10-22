// /v1/friend/incoming.js
const FriendRequest = require('../../schemas/friendRequest.js');
const verifyToken = require('../../middleware/verify.js'); 

async function IncomingFriendRequestsRoute(fastify, options) {
    const io = options.io; 

    fastify.get('/v1/friend/incoming', { preHandler: verifyToken }, async function (request, reply) {
        const userId = request.user.uniqueId;

        try {
            const incomingRequests = await FriendRequest.find({
                requested: userId,
                status: 'pending'
            });

            return reply.code(200).send(incomingRequests);
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });

    io.on('connection', (socket) => {
        fastify.log.info('A user connected via socket');

        socket.on('send friend request', async ({ requesterId, requestedId }) => {
            try {
                const newRequest = new FriendRequest({
                    _id: Date.now(),
                    requester: requesterId,
                    requested: requestedId,
                    status: 'pending',
                });

                await newRequest.save();

                io.to(requestedId).emit('incoming friend request', {
                    requesterId: requesterId,
                    requestedId: requestedId,
                });

                fastify.log.info(`Friend request sent from ${requesterId} to ${requestedId}`);
            } catch (error) {
                console.error('Error sending friend request:', error);
            }
        });

        socket.on('disconnect', () => {
            fastify.log.info('User disconnected from socket');
        });
    });
}

module.exports = IncomingFriendRequestsRoute;
