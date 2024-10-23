// /v1/friend/decline.js
const express = require('express');
const router = express.Router();
const FriendRequest = require('../../schemas/friendRequest.js');
const verifyToken = require('../../middleware/verify.js');

router.post('/decline', verifyToken, async (req, res) => {
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
            return res.status(404).json({ error: 'Friend request not found or already processed.' });
        }

        friendRequest.status = 'rejected';
        await friendRequest.save();

        return res.status(200).json({ success: true, message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
