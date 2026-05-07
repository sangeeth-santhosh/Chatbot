import {
  createChat,
  createMessage,
  getMessages,
  listChats,
} from '../services/chatService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createChatController = asyncHandler(async (req, res) => {
  const chat = await createChat(req.user._id, req.body);
  const io = req.app.get('io');

  if (io) {
    io.emit('chats:update', { chats: await listChats() });
  }

  res.status(201).json({ chat });
});

export const getChatsController = asyncHandler(async (_req, res) => {
  res.json({ chats: await listChats() });
});

export const getMessagesController = asyncHandler(async (req, res) => {
  res.json({ messages: await getMessages(req.params.roomId) });
});

export const createMessageController = asyncHandler(async (req, res) => {
  const message = await createMessage(req.params.roomId, req.user._id, req.body);
  const io = req.app.get('io');

  if (io) {
    io.to(req.params.roomId).emit('message:new', { message });
    io.emit('chats:update', { chats: await listChats() });
  }

  res.status(201).json({ message });
});
