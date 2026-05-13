import { useEffect } from 'react';
import ChatLayout from '../components/chat/ChatLayout.jsx';
import { connectSocket } from '../socket/socketClient.js';
import { useAuthStore } from '../store/authStore.js';
import { useChatStore } from '../store/chatStore.js';

export default function HomePage() {
  const token = useAuthStore((state) => state.token);
  const fetchChats = useChatStore((state) => state.fetchChats);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
  }, [token]);

  return <ChatLayout />;
}
