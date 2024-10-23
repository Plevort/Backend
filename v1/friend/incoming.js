const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verify.js');
const FriendRequest = require('../../schemas/friendRequest.js');
const User = require('../../schemas/user.js');

router.get('/incoming', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uniqueId;

        const pendingRequests = await FriendRequest.find({
            requested: userId,
            status: 'pending'
        });

        if (pendingRequests.length === 0) {
            return res.json({ incomingRequests: [] });
        }

        const incomingRequests = await Promise.all(
            pendingRequests.map(async (request) => {
                const requester = await User.findOne({ uniqueId: request.requester });

                if (requester) {
                    return {
                        id: requester.uniqueId,
                        displayName: requester.displayName
                    };
                }
            })
        );

        res.json({ incomingRequests: incomingRequests.filter(req => req) });

    } catch (error) {
        console.error('Error fetching incoming friend requests:', error);
        res.status(500).json({ error: 'An error occurred while fetching friend requests.' });
    }
});

module.exports = router;
