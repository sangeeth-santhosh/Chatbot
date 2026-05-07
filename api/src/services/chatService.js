import mongoose from 'mongoose';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { AppError } from '../utils/AppError.js';
import { validateText } from '../utils/validators.js';

const chatPopulate = [
  { path: 'participants', select: 'name email' },
  { path: 'createdBy', select: 'name email' },
];

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
  };
}

export function serializeChat(chat) {
  return {
    id: chat._id.toString(),
    prompt: chat.prompt,
    status: chat.status,
    participants: (chat.participants || []).map(serializeUser).filter(Boolean),
    createdBy: serializeUser(chat.createdBy),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}

export function serializeMessage(message) {
  return {
    id: message._id.toString(),
    roomId: message.roomId.toString(),
    sender: serializeUser(message.senderId),
    text: message.text,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export async function createChat(userId, payload) {
  const prompt = validateText(payload.prompt, 'Prompt', 500);

  const chat = await Chat.create({
    prompt,
    createdBy: userId,
    participants: [userId],
    status: 'available',
  });

  const populated = await chat.populate(chatPopulate);
  return serializeChat(populated);
}

export async function listChats() {
  const chats = await Chat.find({})
    .sort({ updatedAt: -1 })
    .populate(chatPopulate)
    .lean(false);

  return chats.map(serializeChat);
}

export async function getMessages(roomId) {
  const chatId = ensureObjectId(roomId, 'roomId');

  const messages = await Message.find({ roomId: chatId })
    .sort({ createdAt: 1 })
    .populate({ path: 'senderId', select: 'name email' });

  return messages.map(serializeMessage);
}

export async function joinChat(roomId, userId) {
  const chatId = ensureObjectId(roomId, 'roomId');
  const userObjectId = ensureObjectId(userId, 'userId');

  const existing = await Chat.findOne({
    _id: chatId,
    participants: userObjectId,
  }).populate(chatPopulate);

  if (existing) {
    return serializeChat(existing);
  }

  const chat = await Chat.findOneAndUpdate(
    {
      _id: chatId,
      status: 'available',
      participants: { $ne: userObjectId },
      'participants.1': { $exists: false },
    },
    [
      {
        $set: {
          participants: {
            $concatArrays: ['$participants', [userObjectId]],
          },
          status: 'occupied',
          updatedAt: '$$NOW',
        },
      },
    ],
    { new: true },
  ).populate(chatPopulate);

  if (!chat) {
    throw new AppError('This chat is already occupied.', 409, 'CHAT_OCCUPIED');
  }

  return serializeChat(chat);
}

export async function leaveChat(roomId, userId) {
  const chatId = ensureObjectId(roomId, 'roomId');
  const userObjectId = ensureObjectId(userId, 'userId');

  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, participants: userObjectId },
    [
      {
        $set: {
          participants: {
            $filter: {
              input: '$participants',
              as: 'participant',
              cond: { $ne: ['$$participant', userObjectId] },
            },
          },
          status: 'available',
          updatedAt: '$$NOW',
        },
      },
    ],
    { new: true },
  ).populate(chatPopulate);

  if (!chat) return null;

  return serializeChat(chat);
}

export async function createMessage(roomId, userId, payload) {
  const chatId = ensureObjectId(roomId, 'roomId');
  const userObjectId = ensureObjectId(userId, 'userId');
  const text = validateText(payload.text, 'Message', 2000);

  const chat = await Chat.findOne({
    _id: chatId,
    participants: userObjectId,
  }).select('_id');

  if (!chat) {
    throw new AppError('Join this chat before sending messages.', 403, 'NOT_IN_CHAT');
  }

  const message = await Message.create({
    roomId: chatId,
    senderId: userObjectId,
    text,
  });

  await Chat.updateOne({ _id: chatId }, { $set: { updatedAt: new Date() } });

  const populated = await message.populate({ path: 'senderId', select: 'name email' });
  return serializeMessage(populated);
}
