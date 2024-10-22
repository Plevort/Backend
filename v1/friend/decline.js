// /v1/friend/decline.js
const FriendRequest = require('../../schemas/friendRequest.js');
const verifyToken = require('../../middleware/verify.js');

async function DeclineFriendRoute(fastify, options) {
    fastify.post('/v1/friend/decline', { preHandler: verifyToken }, async function (request, reply) {
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
                return reply.code(404).send({ error: 'Friend request not found or already processed.' });
            }

            friendRequest.status = 'rejected'; 
            await friendRequest.save();

            return reply.code(200).send({ success: true, message: 'Friend request rejected' });
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });
}

module.exports = DeclineFriendRoute;
