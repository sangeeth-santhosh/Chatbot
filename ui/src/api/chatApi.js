import { apiClient } from './client.js';

export async function fetchChatsRequest() {
  const { data } = await apiClient.get('/chats');
  return data.chats;
}

export async function createChatRequest(payload) {
  const { data } = await apiClient.post('/chats', payload);
  return data.chat;
}

export async function fetchMessagesRequest(roomId) {
  const { data } = await apiClient.get(`/chats/${roomId}/messages`);
  return data.messages;
}
