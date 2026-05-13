import mongoose from 'mongoose';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { validateText } from '../utils/validators.js';

function ensureObjectId(id, fieldName = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}.`, 400, 'INVALID_ID');
  }

  return new mongoose.Types.ObjectId(id);
}

export function serializeUser(user) {
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function serializeChat(chat) {
  const populatedUser = chat.userId && typeof chat.userId === 'object' && chat.userId._id
    ? chat.userId
    : null;
  const userId = populatedUser ? populatedUser._id : chat.userId;

  return {
    id: chat._id.toString(),
    userId: userId ? userId.toString() : null,
    user: serializeUser(populatedUser),
    title: chat.title,
    lastMessage: chat.lastMessage,
    unreadForAdmin: chat.unreadForAdmin,
    unreadForUser: chat.unreadForUser,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}

export function serializeMessage(message) {
  return {
    id: message._id.toString(),
    chatId: message.chatId.toString(),
    senderRole: message.senderRole === 'admin' ? 'ai' : message.senderRole,
    text: message.text,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

function canAccessChat(chat, user) {
  if (user.role === 'admin') {
    return true;
  }

  const chatUserId = chat.userId && typeof chat.userId === 'object' && chat.userId._id
    ? chat.userId._id
    : chat.userId;

  return chatUserId.toString() === user._id.toString();
}

function ensureChatAccess(chat, user) {
  if (!canAccessChat(chat, user)) {
    throw new AppError('You do not have access to this chat.', 403, 'CHAT_FORBIDDEN');
  }
}

export async function createChat(userId, payload) {
  const title = payload.title || 'New Chat';
  const userObjectId = ensureObjectId(userId, 'userId');

  const user = await User.findById(userObjectId).select('name email');
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const chat = await Chat.create({
    userId: userObjectId,
    title,
    lastMessage: null,
    unreadForAdmin: true,
    unreadForUser: false,
  });

  return serializeChat(chat);
}

export async function getUserChats(userId) {
  const userObjectId = ensureObjectId(userId, 'userId');

  const chats = await Chat.find({ userId: userObjectId })
    .sort({ updatedAt: -1 });

  return chats.map(serializeChat);
}

export async function getAdminChats() {
  const chats = await Chat.find({})
    .populate('userId', 'name email role')
    .sort({ updatedAt: -1 });

  return chats.map(serializeChat);
}

export async function getChatById(chatId, user = null) {
  const id = ensureObjectId(chatId, 'chatId');

  const chat = await Chat.findById(id).populate('userId', 'name email role');
  if (!chat) {
    throw new AppError('Chat not found.', 404, 'CHAT_NOT_FOUND');
  }

  if (user) {
    ensureChatAccess(chat, user);
  }

  return serializeChat(chat);
}

export async function getMessages(chatId, user = null) {
  const id = ensureObjectId(chatId, 'chatId');

  if (user) {
    const chat = await Chat.findById(id);
    if (!chat) {
      throw new AppError('Chat not found.', 404, 'CHAT_NOT_FOUND');
    }

    ensureChatAccess(chat, user);
  }

  const messages = await Message.find({ chatId: id })
    .sort({ createdAt: 1 });

  return messages.map(serializeMessage);
}

export async function createMessage(chatId, user, payload) {
  const id = ensureObjectId(chatId, 'chatId');
  const userObjectId = ensureObjectId(user._id, 'userId');
  const text = validateText(payload.text, 'Message', 2000);

  const currentUser = await User.findById(userObjectId).select('name role');
  if (!currentUser) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const chat = await Chat.findById(id);
  if (!chat) {
    throw new AppError('Chat not found.', 404, 'CHAT_NOT_FOUND');
  }

  ensureChatAccess(chat, currentUser);

  const message = await Message.create({
    chatId: id,
    senderRole: currentUser.role === 'admin' ? 'ai' : 'user',
    text,
  });

  if (currentUser.role === 'user') {
    await Chat.updateOne(
      { _id: id },
      {
        $set: {
          lastMessage: text,
          unreadForAdmin: true,
          unreadForUser: false,
          updatedAt: new Date(),
        },
      },
    );
  } else if (currentUser.role === 'admin') {
    await Chat.updateOne(
      { _id: id },
      {
        $set: {
          lastMessage: text,
          unreadForUser: true,
          unreadForAdmin: false,
          updatedAt: new Date(),
        },
      },
    );
  }

  return serializeMessage(message);
}

export async function markChatAsRead(chatId, user) {
  const id = ensureObjectId(chatId, 'chatId');
  const chat = await Chat.findById(id);

  if (!chat) {
    throw new AppError('Chat not found.', 404, 'CHAT_NOT_FOUND');
  }

  ensureChatAccess(chat, user);

  const updateData = {};
  if (user.role === 'admin') {
    updateData.unreadForAdmin = false;
  } else if (user.role === 'user') {
    updateData.unreadForUser = false;
  }

  const updatedChat = await Chat.findByIdAndUpdate(id, { $set: updateData }, { new: true });

  return serializeChat(updatedChat);
}
