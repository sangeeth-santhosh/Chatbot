import { create } from 'zustand';
import { fetchChatsRequest, fetchMessagesRequest } from '../api/chatApi.js';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChatId: null,
  messagesByChat: {},
  loadingChats: false,
  loadingMessages: false,
  error: null,

  setChats: (chats) => set({ chats }),

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  setError: (error) => set({ error }),

  fetchChats: async () => {
    set({ loadingChats: true, error: null });

    try {
      const chats = await fetchChatsRequest();
      set({ chats, loadingChats: false });
    } catch (error) {
      set({ error, loadingChats: false });
    }
  },

  fetchMessages: async (chatId) => {
    set({ loadingMessages: true, error: null });

    try {
      const messages = await fetchMessagesRequest(chatId);
      set((state) => ({
        messagesByChat: { ...state.messagesByChat, [chatId]: messages },
        loadingMessages: false,
      }));
    } catch (error) {
      set({ error, loadingMessages: false });
    }
  },

  setMessages: (chatId, messages) => {
    set((state) => ({
      messagesByChat: { ...state.messagesByChat, [chatId]: messages },
    }));
  },

  addMessage: (message) => {
    set((state) => {
      const chatMessages = state.messagesByChat[message.chatId] || [];

      if (chatMessages.some((item) => item.id === message.id)) {
        return state;
      }

      return {
        messagesByChat: {
          ...state.messagesByChat,
          [message.chatId]: [...chatMessages, message],
        },
      };
    });
  },

  activeChat: () => get().chats.find((chat) => chat.id === get().activeChatId) || null,
}));
