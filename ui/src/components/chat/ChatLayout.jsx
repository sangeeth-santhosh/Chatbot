import { useState } from 'react';
import { Menu, MessageSquarePlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';
import ChatSidebar from './ChatSidebar.jsx';
import ChatViewport from './ChatViewport.jsx';

const ChatLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const clearTypingChat = useSocketStore((state) => state.clearTypingChat);

  const startNewChat = () => {
    if (activeChatId) {
      clearTypingChat(activeChatId);
    }

    setActiveChat(null);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121] text-white">
      <div className="hidden md:block">
        <ChatSidebar />
      </div>

      <div
        aria-hidden={!sidebarOpen}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,320px)] transform transition-transform duration-200 ease-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ChatSidebar onSelect={() => setSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#2f2f2f] bg-[#212121] px-3 md:hidden">
          <button
            aria-label="Open conversations"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-200 transition hover:bg-[#2a2a2a]"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <Menu size={21} />
          </button>
          <div className="min-w-0 px-3 text-center">
            <div className="truncate text-sm font-semibold text-white">
              {user?.role === 'admin' ? 'Admin' : 'ChatBot'}
            </div>
          </div>
          {user?.role !== 'admin' ? (
            <button
              aria-label="New chat"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-200 transition hover:bg-[#2a2a2a]"
              onClick={startNewChat}
              type="button"
            >
              <MessageSquarePlus size={20} />
            </button>
          ) : (
            <span className="h-10 w-10" aria-hidden="true" />
          )}
        </header>

        <ChatViewport />
      </div>
    </div>
  );
};

export default ChatLayout;
