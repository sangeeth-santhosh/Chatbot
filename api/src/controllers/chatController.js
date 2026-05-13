import {
  createChat,
  getAdminChats,
  getChatById,
  getMessages,
  getUserChats,
  markChatAsRead,
} from '../services/chatService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createChatController = asyncHandler(async (req, res) => {
  const chat = await createChat(req.user._id, req.body);
  res.status(201).json({ chat });
});

export const listChatsController = asyncHandler(async (req, res) => {
  let chats;

  if (req.user.role === 'admin') {
    chats = await getAdminChats();
  } else {
    chats = await getUserChats(req.user._id);
  }

  res.json({ chats });
});

export const getChatController = asyncHandler(async (req, res) => {
  const chat = await getChatById(req.params.chatId, req.user);
  res.json({ chat });
});

export const getMessagesController = asyncHandler(async (req, res) => {
  const messages = await getMessages(req.params.chatId, req.user);
  res.json({ messages });
});

export const markChatReadController = asyncHandler(async (req, res) => {
  const chat = await markChatAsRead(req.params.chatId, req.user);
  res.json({ chat });
});
