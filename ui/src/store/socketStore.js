import { create } from 'zustand';

export const useSocketStore = create((set) => ({
  socket: null,
  connected: false,
  connecting: false,
  error: null,
  typingUsersByRoom: {},

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected, connecting: false }),
  setConnecting: (connecting) => set({ connecting }),
  setError: (error) => set({ error }),

  addTypingUser: (roomId, user) => {
    set((state) => {
      const users = state.typingUsersByRoom[roomId] || [];

      if (users.some((item) => item.id === user.id)) {
        return state;
      }

      return {
        typingUsersByRoom: {
          ...state.typingUsersByRoom,
          [roomId]: [...users, user],
        },
      };
    });
  },

  removeTypingUser: (roomId, userId) => {
    set((state) => ({
      typingUsersByRoom: {
        ...state.typingUsersByRoom,
        [roomId]: (state.typingUsersByRoom[roomId] || []).filter((user) => user.id !== userId),
      },
    }));
  },

  clearTypingRoom: (roomId) => {
    set((state) => ({
      typingUsersByRoom: { ...state.typingUsersByRoom, [roomId]: [] },
    }));
  },
}));
