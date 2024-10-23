// /v1/createchat/directmessage.js
const express = require('express');
const router = express.Router();
const Chat = require('../../schemas/chat');
const verifyToken = require('../../middleware/verify');
const generateUniqueId = require('../../middleware/createid');
const User = require('../../schemas/user');

router.post('/directmessage', verifyToken, async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const requestingUser = await User.findOne({ uniqueId: req.user.uniqueId });
    if (!requestingUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const recipientUser = await User.findOne({ uniqueId: id });
    if (!recipientUser || recipientUser.uniqueId === requestingUser.uniqueId) {
        return res.status(403).json({ success: false, message: 'Invalid recipient.' });
    }

    if (!requestingUser.friends.includes(recipientUser.uniqueId)) {
        return res.status(403).json({ success: false, message: 'Recipient is not in your friend list.' });
    }

    try {
        const existingChat = await Chat.findOne({
            type: 'd',
            participants: { $elemMatch: { userId: requestingUser.uniqueId } },
            participants: { $elemMatch: { userId: recipientUser.uniqueId } },
        });

        if (existingChat) {
            return res.status(200).json({ success: true, chatId: existingChat.id.toString() });
        }

        const chatId = await generateUniqueId();
        const newChat = new Chat({
            id: chatId.toString(),
            type: 'd',
            lastMessage: null,
            participants: [
                {
                    userId: requestingUser.uniqueId,
                    role: null, 
                },
                {
                    userId: recipientUser.uniqueId,
                    role: null, 
                },
            ],
        });

        await newChat.save();

        return res.status(201).json({ success: true, chatId: newChat.id.toString() });
    } catch (error) {
        console.error('Error creating chat:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
