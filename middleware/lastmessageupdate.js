// /middleware/lastmessageupdate.js
const Chat = require('../schemas/chat');

module.exports = (io) => {
    // Watch for changes in chat documents
    Chat.watch().on('change', async (change) => {
        console.log('Change detected:', change); // Log the change object

        if (change.operationType === 'update') {
            const chatObjectId = change.documentKey._id; // This is the ObjectId of the chat
            const updatedFields = change.updateDescription.updatedFields;

            // Log the updated fields to debug
            console.log('Updated fields:', updatedFields);

            // Check if the last message was updated
            if (updatedFields.lastMessage) {
                try {
                    // Retrieve the chat document using the ObjectId
                    const chat = await Chat.findById(chatObjectId);

                    if (!chat) {
                        console.error('Chat not found for ObjectId:', chatObjectId);
                        return;
                    }

                    const lastMessage = updatedFields.lastMessage;
                    const chatId = chat.id; // Use the 'id' field from the document
                    const participants = chat.participants.map(p => p.userId); // Get list of user IDs

                    // Emit to all participants in the chat
                    participants.forEach(userId => {
                        io.to(userId).emit('last_message_update', {
                            chatId: chatId,
                            lastMessage: lastMessage,
                        });
                    });
                } catch (err) {
                    console.error('Error finding chat:', err);
                }
            }
        }
    });
};
