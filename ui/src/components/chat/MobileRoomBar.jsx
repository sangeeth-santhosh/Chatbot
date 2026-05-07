import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';

export function MobileRoomBar() {
  const chats = useChatStore((state) => state.chats);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const setMessages = useChatStore((state) => state.setMessages);
  const setError = useChatStore((state) => state.setError);
  const socket = useSocketStore((state) => state.socket);

  const selectRoom = (event) => {
    const roomId = event.target.value;
    const chat = chats.find((item) => item.id === roomId);

    if (!chat || !socket) return;

    if (activeRoomId && activeRoomId !== roomId) {
      socket.emit('leave_chat', { roomId: activeRoomId });
    }

    socket.emit('join_chat', { roomId }, (response) => {
      if (!response?.ok) {
        setError(new Error(response?.error || 'Unable to join room.'));
        return;
      }

      setActiveRoom(roomId);
      setMessages(roomId, response.messages || []);
    });
  };

  return (
    <div className="border-b border-slate-800 bg-[#0f1623] p-3 md:hidden">
      <select
        aria-label="Select a room"
        className="w-full rounded-md border border-slate-700 bg-[#111827] px-3 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 focus:ring-offset-[#0f1623]"
        onChange={selectRoom}
        value={activeRoomId || ''}
      >
        <option value="">Select a room</option>
        {chats.map((chat) => (
          <option key={chat.id} value={chat.id}>
            {chat.prompt} ({chat.status})
          </option>
        ))}
      </select>
    </div>
  );
}
