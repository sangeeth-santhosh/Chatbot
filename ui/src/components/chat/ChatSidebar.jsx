import { LogOut, MessageSquarePlus } from 'lucide-react';
import AdminSidebar from '../admin/AdminSidebar.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';
import { getErrorMessage } from '../../utils/errors.js';

const ChatSidebar = ({ onSelect }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const loadingChats = useChatStore((state) => state.loadingChats);
  const error = useChatStore((state) => state.error);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const setError = useChatStore((state) => state.setError);
  const socket = useSocketStore((state) => state.socket);
  const connected = useSocketStore((state) => state.connected);
  const clearTypingChat = useSocketStore((state) => state.clearTypingChat);
  const onlineUsersById = useSocketStore((state) => state.onlineUsersById);

  const selectChat = (chat) => {
    if (!socket || activeChatId === chat.id) return;

    if (activeChatId) {
      clearTypingChat(activeChatId);
    }

    socket.emit('select_chat', { chatId: chat.id }, (response) => {
      if (!response?.ok) {
        setError(new Error(response?.error || 'Unable to open conversation.'));
        return;
      }

      setActiveChat(chat.id);
      setMessages(chat.id, response.messages || []);
      onSelect?.();
    });
  };

  const startNewChat = () => {
    if (activeChatId) {
      clearTypingChat(activeChatId);
    }
    setActiveChat(null);
    onSelect?.();
  };

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-[#2f2f2f] bg-[#171717] md:h-screen md:w-[260px]">
      <div className="flex items-center justify-between gap-3 border-b border-[#2f2f2f] p-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            {user?.role === 'admin' ? 'Admin' : 'Chats'}
          </div>
          <div className="truncate text-xs text-zinc-500">{user?.email}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {user?.role !== 'admin' && (
            <button
              aria-label="New chat"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-[#242424] hover:text-white"
              onClick={startNewChat}
              type="button"
            >
              <MessageSquarePlus size={18} />
            </button>
          )}
          <button
            aria-label="Logout"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-[#242424] hover:text-white"
            onClick={logout}
            type="button"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 text-xs text-zinc-500">
        <span
          aria-label={connected ? 'Connected' : 'Connecting'}
          className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`}
          role="status"
        />
        {connected ? 'Realtime connected' : 'Connecting'}
      </div>

      {error && (
        <div className="mx-3 mb-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-100">
          <div>{getErrorMessage(error)}</div>
          <button
            className="mt-2 text-red-200 hover:text-white"
            onClick={() => setError(null)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loadingChats && <div className="px-4 py-3 text-sm text-zinc-500">Loading conversations...</div>}

        {!loadingChats && user?.role === 'admin' && (
          <AdminSidebar
            activeChatId={activeChatId}
            chats={chats}
            onSelect={selectChat}
            onlineUsersById={onlineUsersById}
          />
        )}

        {!loadingChats && user?.role !== 'admin' && (
          <div className="space-y-1 px-2 pb-4">
            {chats.length === 0 && (
              <div className="px-2 py-3 text-sm leading-6 text-zinc-500">
                Start a new conversation from the composer.
              </div>
            )}
            {chats.map((chat) => (
              <button
                className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
                  activeChatId === chat.id ? 'bg-[#2a2a2a]' : 'hover:bg-[#242424]'
                }`}
                key={chat.id}
                onClick={() => selectChat(chat)}
                type="button"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium text-white">{chat.title || 'New chat'}</div>
                  {chat.unreadForUser && <span aria-label="Unread" className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="mt-1 truncate text-xs text-zinc-400">
                  {chat.lastMessage || 'New conversation'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
