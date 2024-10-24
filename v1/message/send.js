// /v1/message/send.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Message } = require('../../schemas/message');
const Chat = require('../../schemas/chat');
const verifyToken = require('../../middleware/verify');
const { encrypt } = require('../../middleware/ed');

router.post('/send', verifyToken, async (req, res) => {
    const { chatId, content } = req.body;
    const userId = req.user.uniqueId;

    if (!chatId || !content) {
        return res.status(400).json({ error: 'Chat ID and content are required.' });
    }

    try {
        const chat = await Chat.findOne({ id: chatId });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        const isParticipant = chat.participants.some(participant => participant.userId === userId);
        if (!isParticipant) {
            return res.status(403).json({ error: 'User is not a participant in this chat.' });
        }

        const encryptedContent = encrypt(content);

        const message = new Message({
            mid: new mongoose.Types.ObjectId().toString(),
            cid: chatId,
            uid: userId,
            cnt: encryptedContent,
            e: true,
            ex: true 
        });

        await message.save();

        chat.lastMessage = content.length > 20 ? content.substring(0, 17) + '...' : content;
        await chat.save();

        return res.status(201).json({ messageId: message.mid, content: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
