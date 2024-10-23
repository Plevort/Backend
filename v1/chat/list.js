// /v1/chat/list.js
const express = require('express');
const verifyToken = require('../../middleware/verify');
const User = require('../../schemas/user');
const Chat = require('../../schemas/chat');

const router = express.Router();

router.get('/list', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uniqueId;

        const chats = await Chat.find({ 
            exists: true, 
            'participants.userId': userId 
        });

        const chatList = await Promise.all(chats.map(async chat => {
            const lastMessage = chat.lastMessage || "";
            let chatInfo = {
                id: chat.id,
                lastMessage: lastMessage,
            };

            if (chat.type === 'd') {
                const otherParticipant = chat.participants.find(participant => participant.userId !== userId);
                if (otherParticipant) {
                    const otherUser = await User.findOne({ uniqueId: otherParticipant.userId }, 'displayName');
                    chatInfo.name = otherUser ? otherUser.displayName : "";
                } else {
                    chatInfo.name = "";
                }
            } else {
                chatInfo.name = chat.name;
            }

            return chatInfo;
        }));

        res.json(chatList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching chat list.' });
    }
});