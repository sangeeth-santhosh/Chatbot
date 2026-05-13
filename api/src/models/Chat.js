import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
      maxlength: 100,
    },
    lastMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    unreadForAdmin: {
      type: Boolean,
      default: true,
    },
    unreadForUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

chatSchema.index({ userId: 1, updatedAt: -1 });

export const Chat = mongoose.model('Chat', chatSchema);
