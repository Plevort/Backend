// /v1/friend/accept.js
const FriendRequest = require('../../schemas/friendRequest.js');
const User = require('../../schemas/user.js');
const verifyToken = require('../../middleware/verify.js');

async function AcceptFriendRoute(fastify, options) {
    fastify.post('/v1/friend/accept', { preHandler: verifyToken }, async function (request, reply) {
        const requesterId = request.body.id; 
        const requestedId = request.user.uniqueId; 

        if (!requesterId) {
            return reply.code(400).send({ error: "Requester ID is required." });
        }

        try {
            const friendRequest = await FriendRequest.findOne({
                requester: requesterId, 
                requested: requestedId,
                status: 'pending'
            });

            if (!friendRequest) {
                return reply.code(404).send({ error: 'Friend request not found' });
            }

            const requester = await User.findOne({ uniqueId: requesterId });
            const requestedUser = await User.findOne({ uniqueId: requestedId });

            if (!requester || !requestedUser) {
                return reply.code(404).send({ error: 'User not found.' });
            }

            if (requestedUser.friends.includes(requesterId) || requester.friends.includes(requestedId)) {
                return reply.code(409).send({ error: 'You are already friends with this user.' });
            }

            friendRequest.status = 'accepted';
            await friendRequest.save();

            requester.friends.push(requestedId);
            requestedUser.friends.push(requesterId);

            await requester.save();
            await requestedUser.save();

            return reply.code(200).send({ success: true, message: 'Friend request accepted' });
        } catch (error) {
            console.error('Error accepting friend request:', error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });
}

module.exports = AcceptFriendRoute;
