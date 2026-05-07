import { io } from 'socket.io-client';
import { useChatStore } from '../store/chatStore.js';
import { useSocketStore } from '../store/socketStore.js';

let socket;
const productionSocketUrl = 'https://chatbot-api-sangeeth-santhosh.onrender.com';
const developmentSocketUrl = 'http://localhost:5000';

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

  socket = io(
    import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.PROD ? productionSocketUrl : developmentSocketUrl),
    {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 700,
    },
  );

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
    typingUsersByRoom: {},
  });
}

function bindSocketEvents(activeSocket) {
  const socketStore = useSocketStore.getState();

  activeSocket.on('connect', () => {
    socketStore.setConnected(true);
    socketStore.setError(null);

    const chatStore = useChatStore.getState();

    if (chatStore.activeRoomId) {
      activeSocket.emit('join_chat', { roomId: chatStore.activeRoomId }, (response) => {
        if (response?.ok) {
          chatStore.setMessages(chatStore.activeRoomId, response.messages || []);
        }
      });
    }
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

  activeSocket.on('chats:update', ({ chats }) => {
    useChatStore.getState().setChats(chats);
  });

  activeSocket.on('message:new', ({ message }) => {
    useChatStore.getState().addMessage(message);
  });

  activeSocket.on('typing:start', ({ roomId, user }) => {
    useSocketStore.getState().addTypingUser(roomId, user);
  });

  activeSocket.on('typing:stop', ({ roomId, userId }) => {
    useSocketStore.getState().removeTypingUser(roomId, userId);
  });

  activeSocket.on('participant:left', ({ roomId, userId }) => {
    useSocketStore.getState().removeTypingUser(roomId, userId);
  });
}
