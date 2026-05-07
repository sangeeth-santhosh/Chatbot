import { create } from 'zustand';
import { currentUserRequest, loginRequest, registerRequest } from '../api/authApi.js';
import { disconnectSocket } from '../socket/socketClient.js';
import { clearAuth, readAuth, writeAuth } from '../utils/storage.js';

const storedAuth = readAuth();

export const useAuthStore = create((set, get) => ({
  user: storedAuth.user,
  token: storedAuth.token,
  status: storedAuth.token ? 'checking' : 'idle',
  error: null,
  isAuthenticated: Boolean(storedAuth.token),

  initialize: async () => {
    const { token } = get();

    if (!token) {
      set({ status: 'idle', isAuthenticated: false });
      return;
    }

    try {
      set({ status: 'checking', error: null });
      const { user } = await currentUserRequest();
      writeAuth({ token, user });
      set({ user, token, isAuthenticated: true, status: 'idle' });
    } catch {
      clearAuth();
      disconnectSocket();
      set({ user: null, token: null, isAuthenticated: false, status: 'idle' });
    }
  },

  login: async (email) => {
    set({ status: 'loading', error: null });

    try {
      const auth = await loginRequest({ email });
      writeAuth(auth);
      set({ ...auth, isAuthenticated: true, status: 'idle' });
      return auth;
    } catch (error) {
      set({ status: 'idle', error });
      throw error;
    }
  },

  register: async (payload) => {
    set({ status: 'loading', error: null });

    try {
      const auth = await registerRequest(payload);
      writeAuth(auth);
      set({ ...auth, isAuthenticated: true, status: 'idle' });
      return auth;
    } catch (error) {
      set({ status: 'idle', error });
      throw error;
    }
  },

  logout: () => {
    clearAuth();
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false, status: 'idle', error: null });
  },
}));
