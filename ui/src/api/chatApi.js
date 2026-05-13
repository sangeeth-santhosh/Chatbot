import { apiClient } from './client.js';

export async function fetchChatsRequest() {
  const { data } = await apiClient.get('/chats');
  return data.chats;
}

export async function createChatRequest(payload) {
  const { data } = await apiClient.post('/chats', payload);
  return data.chat;
}

export async function getChatRequest(chatId) {
  const { data } = await apiClient.get(`/chats/${chatId}`);
  return data.chat;
}

export async function fetchMessagesRequest(chatId) {
  const { data } = await apiClient.get(`/chats/${chatId}/messages`);
  return data.messages;
}

export async function markChatReadRequest(chatId) {
  const { data } = await apiClient.put(`/chats/${chatId}/read`);
  return data.chat;
}
