import { formatTime } from '../../utils/date.js';

const AdminConversationList = ({ activeChatId, chats, onSelect, onlineUsersById }) => {
  return (
    <div className="space-y-1 px-2 pb-4">
      {chats.map((chat) => {
        const isActive = activeChatId === chat.id;
        const isOnline = Boolean(chat.userId && onlineUsersById[chat.userId]);

        return (
          <button
            aria-label={`Open conversation with ${chat.user?.email || chat.title}`}
            className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
              isActive ? 'bg-[#2a2a2a]' : 'hover:bg-[#242424]'
            }`}
            key={chat.id}
            onClick={() => onSelect(chat)}
            type="button"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 truncate text-sm font-medium text-white">
                {chat.user?.email || 'Unknown user'}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isOnline && <span aria-label="Online" className="h-2 w-2 rounded-full bg-emerald-400" />}
                {chat.unreadForAdmin && <span aria-label="Unread" className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </div>
            <div className="mt-1 truncate text-xs text-zinc-400">
              {chat.lastMessage || chat.title || 'New conversation'}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">
              {formatTime(chat.updatedAt)}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default AdminConversationList;
