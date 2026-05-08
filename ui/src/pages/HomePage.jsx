import { useEffect, useMemo } from 'react';
import { ChatHeader } from '../components/chat/ChatHeader.jsx';
import { CreateChatForm } from '../components/chat/CreateChatForm.jsx';
import { MessageInput } from '../components/chat/MessageInput.jsx';
import { MessageList } from '../components/chat/MessageList.jsx';
import { MobileRoomBar } from '../components/chat/MobileRoomBar.jsx';
import { TypingIndicator } from '../components/chat/TypingIndicator.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { connectSocket } from '../socket/socketClient.js';
import { useAuthStore } from '../store/authStore.js';
import { useChatStore } from '../store/chatStore.js';
import { useSocketStore } from '../store/socketStore.js';

export default function HomePage() {
  const token = useAuthStore((state) => state.token);
  const fetchChats = useChatStore((state) => state.fetchChats);
  const chats = useChatStore((state) => state.chats);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const messagesByRoom = useChatStore((state) => state.messagesByRoom);
  const loadingMessages = useChatStore((state) => state.loadingMessages);
  const typingUsersByRoom = useSocketStore((state) => state.typingUsersByRoom);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeRoomId) || null,
    [activeRoomId, chats],
  );
  const messages = activeRoomId ? messagesByRoom[activeRoomId] || [] : [];
  const typingUsers = activeRoomId ? typingUsersByRoom[activeRoomId] || [] : [];

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
  }, [token]);

  return (
    <AppLayout>
      <CreateChatForm />
      <MobileRoomBar />
      <ChatHeader chat={activeChat} />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <MessageList chat={activeChat} loading={loadingMessages} messages={messages} />
      </div>
      <TypingIndicator users={typingUsers} />
      <MessageInput chat={activeChat} />
    </AppLayout>
  );
}
