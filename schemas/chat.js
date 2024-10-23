// /schemas/chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        enum: ['d', 'g', 's'],
        required: true,
    },
    name: {
        type: String,
        default: null, 
    },
    exists: {
        type: Boolean,
        default: true,
    },
    lastMessage: {
        type: String,
        default: null,
    },
    userIds: {
        type: [String],
        required: true,
    },
    participants: [{
        userId: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: null,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    }],
}, {
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
