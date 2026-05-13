import { useAuthStore } from '../../store/authStore.js';
import { formatTime } from '../../utils/date.js';

const ChatMessage = ({ chat, message }) => {
  const user = useAuthStore((state) => state.user);
  const isUser = message.senderRole === 'user';
  const isOwn = user?.role === 'admin' ? !isUser : isUser;
  const label = isUser
    ? chat?.user?.name || user?.name || 'You'
    : 'AI Assistant';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] whitespace-pre-wrap rounded-3xl px-5 py-3 text-sm leading-7 sm:max-w-[80%] ${
          isUser
            ? 'bg-[#303030] text-white'
            : 'bg-transparent text-white'
        }`}
      >
        <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-medium">{label}</span>
          <span aria-hidden="true">/</span>
          <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
        </div>
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;
