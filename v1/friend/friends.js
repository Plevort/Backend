// v1/friend/friends.js
const express = require('express');
const router = express.Router();
const User = require('../../schemas/user.js');
const verifyToken = require('../../middleware/verify.js');

router.get('/friends', verifyToken, async (req, res) => {
    const userId = req.user.uniqueId;

    try {
        const user = await User.findOne({ uniqueId: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const friendsData = await User.find({ uniqueId: { $in: user.friends } }, 'uniqueId displayName');

        const formattedFriends = friendsData.map(friend => ({
            id: friend.uniqueId,
            displayName: friend.displayName
        }));

        return res.status(200).json({ friends: formattedFriends });
    } catch (error) {
        console.error('Error fetching friends:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
