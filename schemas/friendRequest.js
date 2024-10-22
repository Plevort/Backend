// /schemas/friendRequest.js
const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  _id: {
    type: Number, 
    required: true,
  },
  requester: {
    type: Number, 
    required: true,
  },
  requested: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
