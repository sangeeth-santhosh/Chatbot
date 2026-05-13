import { io } from 'socket.io-client';
import { useChatStore } from '../store/chatStore.js';
import { useSocketStore } from '../store/socketStore.js';

let socket;
const socketUrl = import.meta.env?.VITE_SOCKET_URL || 'http://localhost:5000';

export function getSocket() {
  return socket;
}

export function connectSocket(token) {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  const socketStore = useSocketStore.getState();
  socketStore.setConnecting(true);

  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 700,
  });

  socketStore.setSocket(socket);
  bindSocketEvents(socket);
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  useSocketStore.setState({
    socket: null,
    connected: false,
    connecting: false,
    error: null,
    typingUsersByChat: {},
    onlineUsersById: {},
  });
}

function bindSocketEvents(activeSocket) {
  const socketStore = useSocketStore.getState();

  activeSocket.on('connect', () => {
    socketStore.setConnected(true);
    socketStore.setError(null);
    syncActiveChat(activeSocket);
  });

  activeSocket.on('disconnect', () => {
    socketStore.setConnected(false);
  });

  activeSocket.on('connect_error', (error) => {
    socketStore.setError(error.message);
    socketStore.setConnected(false);
  });

  activeSocket.on('socket:error', (error) => {
    useChatStore.getState().setError(new Error(error.message));
  });

  activeSocket.on('chat_updated', ({ chats }) => {
    useChatStore.getState().setChats(chats);
  });

  activeSocket.on('receive_message', ({ message }) => {
    useChatStore.getState().addMessage(message);
  });

  activeSocket.on('typing_start', ({ chatId, user }) => {
    useSocketStore.getState().addTypingUser(chatId, user);
  });

  activeSocket.on('typing_stop', ({ chatId, userId }) => {
    useSocketStore.getState().removeTypingUser(chatId, userId);
  });

  activeSocket.on('user_online', (user) => {
    useSocketStore.getState().setUserOnline(user);
  });

  activeSocket.on('user_offline', ({ userId }) => {
    useSocketStore.getState().setUserOffline(userId);
    const typingUsersByChat = useSocketStore.getState().typingUsersByChat;
    Object.keys(typingUsersByChat).forEach((chatId) => {
      useSocketStore.getState().removeTypingUser(chatId, userId);
    });
  });
}

function syncActiveChat(activeSocket) {
  const chatStore = useChatStore.getState();
  const activeChatId = chatStore.activeChatId;

  if (!activeChatId) return;

  activeSocket.emit('select_chat', { chatId: activeChatId }, (response) => {
    if (activeSocket !== socket) return;

    if (!response?.ok) {
      chatStore.setError(new Error(response?.error || 'Unable to reconnect conversation.'));
      return;
    }

    useChatStore.getState().setMessages(activeChatId, response.messages || []);
  });
}
