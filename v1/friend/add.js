// /v1/friend/add.js
const express = require('express');
const router = express.Router();
const User = require('../../schemas/user.js');
const FriendRequest = require('../../schemas/friendRequest.js');
const verifyToken = require('../../middleware/verify.js');

router.post('/add', verifyToken, async (req, res) => {
    const { username } = req.body;
    const requesterId = req.user.uniqueId;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const requestedUser = await User.findOne({ username: username.toLowerCase() });

        if (!requestedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const requestedId = requestedUser.uniqueId;

        if (requestedId === requesterId) {
            return res.status(400).json({ error: 'You cannot add yourself as a friend' });
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
                return res.status(200).json({ success: true, message: 'Friend request resent' });
            }
            return res.status(400).json({ error: 'Friend request already sent or in progress' });
        }

        const newRequest = new FriendRequest({
            _id: Date.now(),
            requester: requesterId,
            requested: requestedId,
            status: 'pending',
        });

        await newRequest.save();
        return res.status(200).json({ success: true, message: 'Friend request sent' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
