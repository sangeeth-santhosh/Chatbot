import { create } from 'zustand';
import { fetchChatsRequest, fetchMessagesRequest } from '../api/chatApi.js';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeRoomId: null,
  messagesByRoom: {},
  loadingChats: false,
  loadingMessages: false,
  error: null,

  setChats: (chats) => set({ chats }),

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

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

  fetchMessages: async (roomId) => {
    set({ loadingMessages: true, error: null });

    try {
      const messages = await fetchMessagesRequest(roomId);
      set((state) => ({
        messagesByRoom: { ...state.messagesByRoom, [roomId]: messages },
        loadingMessages: false,
      }));
    } catch (error) {
      set({ error, loadingMessages: false });
    }
  },

  setMessages: (roomId, messages) => {
    set((state) => ({
      messagesByRoom: { ...state.messagesByRoom, [roomId]: messages },
    }));
  },

  addMessage: (message) => {
    set((state) => {
      const roomMessages = state.messagesByRoom[message.roomId] || [];

      if (roomMessages.some((item) => item.id === message.id)) {
        return state;
      }

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [message.roomId]: [...roomMessages, message],
        },
      };
    });
  },

  activeChat: () => get().chats.find((chat) => chat.id === get().activeRoomId) || null,
}));
