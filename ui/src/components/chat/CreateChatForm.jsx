import { useState } from 'react';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';

export function CreateChatForm() {
  const [prompt, setPrompt] = useState('');
  const socket = useSocketStore((state) => state.socket);
  const connected = useSocketStore((state) => state.connected);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const setMessages = useChatStore((state) => state.setMessages);
  const setError = useChatStore((state) => state.setError);
  const [loading, setLoading] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const value = prompt.trim();

    if (!value || !socket) return;

    setLoading(true);

    if (activeRoomId) {
      socket.emit('leave_chat', { roomId: activeRoomId });
    }

    socket.emit('create_chat', { prompt: value }, (response) => {
      setLoading(false);

      if (!response?.ok) {
        setError(new Error(response?.error || 'Unable to create chat.'));
        return;
      }

      setPrompt('');
      setActiveRoom(response.chat.id);
      setMessages(response.chat.id, []);
    });
  };

  return (
    <form className="border-b border-slate-800 bg-[#0b0f19] p-4" onSubmit={submit}>
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row">
        <input
          aria-label="Chat room prompt"
          className="min-h-11 flex-1 rounded-md border border-slate-700 bg-[#111827] px-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!connected || loading}
          maxLength={500}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Create a chat room prompt..."
          value={prompt}
        />
        <button
          aria-label={loading ? 'Creating room' : 'Create room'}
          className="h-11 rounded-md bg-emerald-500 px-5 text-sm font-medium text-slate-950 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0b0f19] disabled:opacity-50 disabled:cursor-not-allowed transition"
          disabled={!connected || loading || !prompt.trim()}
          type="submit"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}
