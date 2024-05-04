import mongoose from "mongoose";

// Define Schema for Conversations
const conversationSchema = new mongoose.Schema({
  participants: [{
    _id: false,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    pending_message: {
      type: Number,
      default: 0
    }
  }],
  messages: [{
    _id: false,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contentType: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

conversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    const senderId = this.messages[this.messages.length - 1].sender;
    const recipient = this.participants.find(participant => participant.user.toString() !== senderId.toString());
    
    if (recipient) {
      recipient.pending_message += 1;
    }
  }
  next();
});

// Create Conversation model
const conversation = mongoose.model('conversation', conversationSchema);

export default conversation;
