import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';
import { getErrorMessage } from '../../utils/errors.js';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const chats = useChatStore((state) => state.chats);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const loadingChats = useChatStore((state) => state.loadingChats);
  const error = useChatStore((state) => state.error);
  const setError = useChatStore((state) => state.setError);
  const connected = useSocketStore((state) => state.connected);
  const socket = useSocketStore((state) => state.socket);
  const clearTypingRoom = useSocketStore((state) => state.clearTypingRoom);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const setMessages = useChatStore((state) => state.setMessages);

  const sortedChats = useMemo(() => chats, [chats]);

  const selectChat = (chat) => {
    if (!socket || activeRoomId === chat.id) return;

    if (activeRoomId) {
      socket.emit('leave_chat', { roomId: activeRoomId });
      clearTypingRoom(activeRoomId);
    }

    socket.emit('join_chat', { roomId: chat.id }, (response) => {
      if (!response?.ok) {
        setError(new Error(response?.error || 'Unable to join chat.'));
        return;
      }

      setActiveRoom(chat.id);
      setMessages(chat.id, response.messages || []);
    });
  };

  useEffect(() => {
    return () => {
      if (socket && activeRoomId) {
        socket.emit('leave_chat', { roomId: activeRoomId });
      }
    };
  }, [activeRoomId, socket]);

  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-800 bg-[#0f1623] md:flex md:flex-col">
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            aria-label="Logout"
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 focus:ring-offset-[#0f1623] transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={logout}
            type="button"
          >
            Logout
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <span
            className={`h-3 w-3 rounded-full transition ${
              connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
            }`}
            aria-label={connected ? 'Connected' : 'Connecting...'}
            role="status"
          />
          {connected ? 'Realtime connected' : 'Connecting'}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Rooms</h2>
        <span className="text-xs text-slate-500">{chats.length}</span>
      </div>

      {error && (
        <div className="mx-4 mb-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-100" role="alert">
          <div>{getErrorMessage(error)}</div>
          <button
            aria-label="Dismiss error"
            className="mt-2 text-red-200 hover:text-red-100 focus:outline-none focus:underline transition"
            onClick={() => setError(null)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {loadingChats && <p className="px-2 py-3 text-sm text-slate-400">Loading rooms...</p>}

        {!loadingChats && sortedChats.length === 0 && (
          <p className="px-2 py-3 text-sm leading-6 text-slate-500">
            No rooms yet. Create one from the prompt input.
          </p>
        )}

        <div className="space-y-1">
          {sortedChats.map((chat) => {
            const active = chat.id === activeRoomId;
            const disabled = chat.status === 'occupied' && !chat.participants.some((item) => item.id === user?.id);
            const participantsText = chat.participants.map((item) => item.name).join(', ') || 'No participants';

            return (
              <button
                aria-label={`${active ? 'Current room:' : ''} ${chat.prompt}${disabled ? ' (Occupied)' : ''}`}
                className={`w-full rounded-md px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 focus:ring-offset-[#0f1623] ${
                  active
                    ? 'bg-slate-800 text-white'
                    : disabled
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-900'
                }`}
                disabled={disabled}
                key={chat.id}
                onClick={() => selectChat(chat)}
                title={chat.prompt}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{chat.prompt}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                      chat.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-amber-500/10 text-amber-300'
                    }`}
                    aria-label={`Status: ${chat.status}`}
                  >
                    {chat.status}
                  </span>
                </div>
                <p className="mt-2 truncate text-xs text-slate-500" title={participantsText}>
                  {participantsText}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
