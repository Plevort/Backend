// /v1/friend/add.js
const User = require('../../schemas/user.js');
const FriendRequest = require('../../schemas/friendRequest.js');
const verifyToken = require('../../middleware/verify.js');

async function AddFriendRoute(fastify, options) {
    fastify.post('/v1/friend/add', { preHandler: verifyToken }, async function (request, reply) {
        const { username } = request.body;
        const requesterId = request.user.uniqueId;

        if (!username) {
            return reply.code(400).send({ error: 'Username is required' });
        }

        try {
            const requestedUser = await User.findOne({ username: username.toLowerCase() });

            if (!requestedUser) {
                return reply.code(404).send({ error: 'User not found' });
            }

            const requestedId = requestedUser.uniqueId;

            if (requestedId === requesterId) {
                return reply.code(400).send({ error: 'You cannot add yourself as a friend' });
            }

            const existingRequest = await FriendRequest.findOne({
                $or: [
                    { requester: requesterId, requested: requestedId },
                    { requester: requestedId, requested: requesterId } 
                ]
            });

            if (existingRequest) {
                if (existingRequest.status === 'rejected') {
                    existingRequest.status = 'pending';
                    await existingRequest.save();
                    return reply.code(200).send({ success: true, message: 'Friend request resent' });
                }

                return reply.code(400).send({ error: 'Friend request already sent or in progress' });
            }

            const newRequest = new FriendRequest({
                _id: Date.now(), 
                requester: requesterId,
                requested: requestedId,
                status: 'pending',
            });

            await newRequest.save();

            return reply.code(200).send({ success: true, message: 'Friend request sent' });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });
}

module.exports = AddFriendRoute;
