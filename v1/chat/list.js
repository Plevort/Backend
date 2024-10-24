const express = require('express');
const verifyToken = require('../../middleware/verify');
const User = require('../../schemas/user');
const Chat = require('../../schemas/chat');

const router = express.Router();
let io; 

const initializeChatList = (socketIoInstance) => {
    io = socketIoInstance; 

    const changeStream = Chat.watch();

    changeStream.on('change', async (change) => {
        if (change.operationType === 'update') {
            const updatedChatId = change.documentKey._id;

            try {
                const updatedChat = await Chat.findById(updatedChatId);

                const participants = updatedChat.participants;

                for (const participant of participants) {
                    io.to(participant.userId).emit('chatUpdated', {
                        id: updatedChat.id,
                        lastMessage: updatedChat.lastMessage || "",
                        name: updatedChat.type === 'd' ? await getParticipantName(participant.userId) : updatedChat.name,
                    });
                }
            } catch (error) {
                console.error('Error fetching updated chat:', error);
            }
        }
    });
};

const getParticipantName = async (userId) => {
    const user = await User.findOne({ uniqueId: userId }, 'displayName');
    return user ? user.displayName : "";
};

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

module.exports = {
    router,
    initializeChatList,
};
