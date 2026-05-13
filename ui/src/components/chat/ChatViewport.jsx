import { useEffect, useMemo, useRef } from 'react';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';
import ChatComposer from './ChatComposer.jsx';
import ChatMessage from './ChatMessage.jsx';
import EmptyState from './EmptyState.jsx';
import TypingIndicator from './TypingIndicator.jsx';

const ChatViewport = () => {
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const loadingMessages = useChatStore((state) => state.loadingMessages);
  const typingUsersByChat = useSocketStore((state) => state.typingUsersByChat);
  const bottomRef = useRef(null);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) || null,
    [activeChatId, chats],
  );
  const messages = useMemo(
    () => (activeChatId ? messagesByChat[activeChatId] || [] : []),
    [activeChatId, messagesByChat],
  );
  const typingUsers = useMemo(
    () => (activeChatId ? typingUsersByChat[activeChatId] || [] : []),
    [activeChatId, typingUsersByChat],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  if (!activeChatId) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <EmptyState />
          <ChatComposer />
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col">
      <div className="border-b border-[#2f2f2f] px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="truncate text-sm font-medium text-white">
            {activeChat?.user?.email || activeChat?.title || 'Conversation'}
          </div>
          {activeChat?.user?.email && (
            <div className="truncate text-xs text-zinc-500">{activeChat.title}</div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {loadingMessages && <div className="text-sm text-zinc-500">Loading messages...</div>}
          {!loadingMessages && messages.map((message) => (
            <ChatMessage
              chat={activeChat}
              key={message.id}
              message={message}
            />
          ))}
          <TypingIndicator users={typingUsers} />
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#212121] px-4 pb-6">
        <div className="mx-auto max-w-3xl">
          <ChatComposer />
        </div>
      </div>
    </main>
  );
};

export default ChatViewport;
