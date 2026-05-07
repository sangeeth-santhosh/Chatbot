import { EmptyState } from '../common/EmptyState.jsx';
import { useAutoScroll } from '../../hooks/useAutoScroll.js';
import { useAuthStore } from '../../store/authStore.js';
import { formatTime } from '../../utils/date.js';

export function MessageList({ chat, messages, loading }) {
  const user = useAuthStore((state) => state.user);
  const bottomRef = useAutoScroll();

  if (!chat) {
    return (
      <EmptyState
        title="Select or create a room"
        body="Available rooms appear in the sidebar. Create a prompt to start a new conversation."
      />
    );
  }

  if (loading) {
    return <EmptyState title="Loading messages..." />;
  }

  if (messages.length === 0) {
    return <EmptyState title="No messages yet" body="Send the first message when both participants are ready." />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-6 overflow-x-hidden">
      {messages.map((message) => {
        const own = message.sender?.id === user?.id;

        return (
          <article className={`flex ${own ? 'justify-end' : 'justify-start'}`} key={message.id}>
            <div
              className={`max-w-[88%] sm:max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-3 overflow-hidden ${
                own ? 'bg-emerald-500 text-slate-950' : 'bg-[#151f2f] text-slate-100'
              }`}
            >
              <div className={`mb-1 text-xs flex items-center gap-2 ${own ? 'text-slate-800' : 'text-slate-400'}`}>
                <span className="font-medium">{message.sender?.name || 'Unknown'}</span>
                <span>·</span>
                <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
            </div>
          </article>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
