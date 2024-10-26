// /v1/message/read.js
const express = require('express');
const router = express.Router();
const { Message } = require('../../schemas/message'); 
const Chat = require('../../schemas/chat'); 
const User = require('../../schemas/user');
const verifyToken = require('../../middleware/verify');
const { decrypt } = require('../../middleware/ed'); 
require('dotenv').config();

router.get('/read', verifyToken, async (req, res) => {
    const { cid, p } = req.query; 
    const uid = req.user.uniqueId;

    try {
        const page = p && !isNaN(p) && p >= 1 ? parseInt(p) : 1;

        const chat = await Chat.findOne({ id: cid, exists: true });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (!chat.participants.some(participant => participant.userId === uid)) {
            return res.status(403).json({ error: 'User not a participant in the chat' });
        }

        const skip = (page - 1) * 50;
        const messages = await Message.find({ cid, ex: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(50);

        if (messages.length === 0) {
            console.log('No messages found');
            return res.status(200).json({ page: page, messages: [] });
        }

        const userIds = [...new Set(messages.map(msg => msg.uid))];

        const users = await User.find({ uniqueId: { $in: userIds } }, 'uniqueId displayName');
        const userDisplayNameMap = users.reduce((map, user) => {
            map[user.uniqueId] = user.displayName;
            return map;
        }, {});

        const responseMessages = messages.map((msg, index) => {
            try {
                const decryptedContent = decrypt(msg.cnt); 
                return {
                    index: skip + index + 1, 
                    mid: msg.mid,
                    uid: msg.uid,
                    displayName: userDisplayNameMap[msg.uid] || 'Unknown',
                    cnt: decryptedContent,
                    createdAt: msg.createdAt
                };
            } catch (error) {
                return {
                    index: skip + index + 1, 
                    mid: msg.mid,
                    uid: msg.uid,
                    displayName: userDisplayNameMap[msg.uid] || 'Unknown',
                    cnt: "Failed to decrypt",
                    createdAt: msg.createdAt
                };
            }
        });

        res.status(200).json({ page: page, messages: responseMessages.reverse() });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

