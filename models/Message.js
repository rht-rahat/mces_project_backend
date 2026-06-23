const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true // uniquely groups chat history per user
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
