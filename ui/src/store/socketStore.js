import { create } from 'zustand';

export const useSocketStore = create((set) => ({
  socket: null,
  connected: false,
  connecting: false,
  error: null,
  typingUsersByChat: {},
  onlineUsersById: {},

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected, connecting: false }),
  setConnecting: (connecting) => set({ connecting }),
  setError: (error) => set({ error }),

  addTypingUser: (chatId, user) => {
    set((state) => {
      const current = state.typingUsersByChat[chatId];
      const users = Array.isArray(current) ? current : [];

      if (users.some((item) => item.id === user.id)) {
        return state;
      }

      return {
        typingUsersByChat: {
          ...state.typingUsersByChat,
          [chatId]: [...users, user],
        },
      };
    });
  },

  removeTypingUser: (chatId, userId) => {
    set((state) => {
      const current = state.typingUsersByChat[chatId];
      const users = Array.isArray(current) ? current : [];

      return {
        typingUsersByChat: {
          ...state.typingUsersByChat,
          [chatId]: users.filter((user) => user.id !== userId),
        },
      };
    });
  },

  clearTypingChat: (chatId) => {
    set((state) => ({
      typingUsersByChat: { ...state.typingUsersByChat, [chatId]: [] },
    }));
  },

  setUserOnline: (user) => {
    set((state) => ({
      onlineUsersById: {
        ...state.onlineUsersById,
        [user.userId]: user,
      },
    }));
  },

  setUserOffline: (userId) => {
    set((state) => {
      const nextOnlineUsers = { ...state.onlineUsersById };
      delete nextOnlineUsers[userId];

      return { onlineUsersById: nextOnlineUsers };
    });
  },
}));
