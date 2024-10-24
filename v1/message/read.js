// /v1/message/read.js
const express = require('express');
const router = express.Router();
const { Message } = require('../../schemas/message'); 
const Chat = require('../../schemas/chat'); 
const verifyToken = require('../../middleware/verify');
const { decrypt } = require('../../middleware/ed'); 
require('dotenv').config();

router.get('/read', verifyToken, async (req, res) => {
    const { cid, p } = req.query; 
    const uid = req.user.uniqueId;

    try {
        console.log(`User ID: ${uid}, Chat ID: ${cid}, Query Page: ${p}`);

        const page = p && !isNaN(p) && p >= 1 ? parseInt(p) : 1;
        console.log(`Using page: ${page}`);

        const chat = await Chat.findOne({ id: cid, exists: true });
        if (!chat) {
            console.log(`Chat not found for ID: ${cid}`);
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (!chat.participants.some(participant => participant.userId === uid)) {
            console.log(`User ${uid} is not a participant in chat ${cid}`);
            return res.status(403).json({ error: 'User not a participant in the chat' });
        }

        const skip = (page - 1) * 50;
        console.log(`Skipping messages: ${skip}`);

        // Sort messages by 'createdAt' in descending order (newest first)
        const messages = await Message.find({ cid, ex: true })
            .sort({ createdAt: -1 }) // Sorting by newest first
            .skip(skip)
            .limit(50);

        console.log(`Messages fetched: ${messages.length}`);

        if (messages.length === 0) {
            console.log('No messages found');
            return res.status(200).json({ page: page, messages: [] });
        }

        const responseMessages = messages.map((msg, index) => {
            try {
                console.log(`Attempting to decrypt message ID: ${msg.mid}`);
                console.log(`Encrypted content: ${msg.cnt}`);
                const decryptedContent = decrypt(msg.cnt); 
                console.log(`Decrypted content: ${decryptedContent}`);
                
                return {
                    index: skip + index + 1, 
                    mid: msg.mid,
                    uid: msg.uid,
                    cnt: decryptedContent,
                    createdAt: msg.createdAt
                };
            } catch (error) {
                console.error(`Failed to decrypt message ID ${msg.mid}:`, error);
                return {
                    index: skip + index + 1, 
                    mid: msg.mid,
                    uid: msg.uid,
                    cnt: "Failed to decrypt",
                    createdAt: msg.createdAt
                };
            }
        });

        // Reverse the response messages array to maintain proper order on the page
        res.status(200).json({ page: page, messages: responseMessages.reverse() });
    } catch (error) {
        console.error('Error in /read route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
