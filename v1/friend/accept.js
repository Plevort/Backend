// /v1/friend/accept.js
const express = require('express');
const router = express.Router();
const FriendRequest = require('../../schemas/friendRequest.js');
const User = require('../../schemas/user.js');
const verifyToken = require('../../middleware/verify.js');
const socketIO = require('../../socket.js'); 

router.post('/accept', verifyToken, async (req, res) => {
    const requesterId = req.body.id; 
    const requestedId = req.user.uniqueId;

    if (!requesterId) {
        return res.status(400).json({ error: "Requester ID is required." });
    }

    try {
        const friendRequest = await FriendRequest.findOne({
            requester: requesterId,
            requested: requestedId,
            status: 'pending'
        });

        if (!friendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        const requester = await User.findOne({ uniqueId: requesterId });
        const requestedUser = await User.findOne({ uniqueId: requestedId });

        if (!requester || !requestedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (requestedUser.friends.includes(requesterId) || requester.friends.includes(requestedId)) {
            return res.status(409).json({ error: 'You are already friends with this user.' });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        requester.friends.push(requestedId);
        requestedUser.friends.push(requesterId);

        await requester.save();
        await requestedUser.save();

        const usersToNotify = [requesterId, requestedId];
        const displayNameRequester = requester.displayName;
        const displayNameRequested = requestedUser.displayName;

        usersToNotify.forEach(userId => {
            const userSocket = Array.from(socketIO.sockets.sockets.values()).find(s => s.user && s.user.uniqueId === userId);
            if (userSocket) {
                userSocket.emit('friend_added', { 
                    requesterId, 
                    requestedId, 
                    displayNameRequester, 
                    displayNameRequested 
                });
            }
        });

        return res.status(200).json({ success: true, message: 'Friend request accepted' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
