// /schemas/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    mid: { // Message ID
        type: String,
        required: true,
        unique: true,
        index: true 
    },
    cid: { // Chat ID
        type: String,
        required: true,
        index: true 
    },
    uid: { // User ID
        type: String,
        required: true
    },
    cnt: { // Content 
        type: String,
        required: true
    },
    e: { // Encryption 
        type: Boolean,
        default: false 
    },
    ex: { // Exists 
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, 
    index: { createdAt: 1 }
});
messageSchema.index({ cid: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = { Message };
