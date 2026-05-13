import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';

export function MobileChatBar() {
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const setError = useChatStore((state) => state.setError);
  const clearTypingChat = useSocketStore((state) => state.clearTypingChat);
  const socket = useSocketStore((state) => state.socket);

  const selectChat = (event) => {
    const chatId = event.target.value;
    const chat = chats.find((item) => item.id === chatId);

    if (!chat || !socket) return;

    if (activeChatId && activeChatId !== chatId) {
      clearTypingChat(activeChatId);
    }

    socket.emit('select_chat', { chatId }, (response) => {
      if (!response?.ok) {
        setError(new Error(response?.error || 'Unable to open conversation.'));
        return;
      }

      setActiveChat(chatId);
      setMessages(chatId, response.messages || []);
    });
  };

  return (
    <div className="border-b border-slate-800 bg-[#0f1623] p-3 md:hidden">
      <select
        aria-label="Select a conversation"
        className="w-full rounded-md border border-slate-700 bg-[#111827] px-3 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 focus:ring-offset-[#0f1623]"
        onChange={selectChat}
        value={activeChatId || ''}
      >
        <option value="">Select a conversation</option>
        {chats.map((chat) => (
          <option key={chat.id} value={chat.id}>
            {chat.user?.email ? `${chat.user.email} - ` : ''}
            {chat.title || 'Untitled'}
          </option>
        ))}
      </select>
    </div>
  );
}
