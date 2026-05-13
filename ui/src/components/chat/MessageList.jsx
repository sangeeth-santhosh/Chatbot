import { EmptyState } from '../common/EmptyState.jsx';
import { useAutoScroll } from '../../hooks/useAutoScroll.js';
import { useAuthStore } from '../../store/authStore.js';
import { formatTime } from '../../utils/date.js';

function getMessageLabel(message, chat, viewer) {
  if (message.senderRole === 'ai') {
    return 'AI Assistant';
  }

  if (viewer?.role === 'admin') {
    return chat?.user?.name || chat?.user?.email || 'User';
  }

  return viewer?.name || 'You';
}

export function MessageList({ chat, messages, loading }) {
  const user = useAuthStore((state) => state.user);
  const bottomRef = useAutoScroll();

  if (!chat) {
    return (
      <EmptyState
        title="Select or create a conversation"
        body="Your conversations appear in the sidebar."
      />
    );
  }

  if (loading) {
    return <EmptyState title="Loading messages..." />;
  }

  if (messages.length === 0) {
    return <EmptyState title="No messages yet" body="Start the conversation by sending the first message." />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 overflow-x-hidden px-4 py-6">
      {messages.map((message) => {
        const isOwnMessage = user?.role === 'admin'
          ? message.senderRole === 'ai'
          : message.senderRole === 'user';
        const label = getMessageLabel(message, chat, user);

        return (
          <article className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`} key={message.id}>
            <div
              className={`max-w-[88%] overflow-hidden rounded-lg px-4 py-3 sm:max-w-[80%] md:max-w-[70%] ${
                isOwnMessage ? 'bg-emerald-500 text-slate-950' : 'bg-[#151f2f] text-slate-100'
              }`}
            >
              <div className={`mb-1 flex items-center gap-2 text-xs ${isOwnMessage ? 'text-slate-800' : 'text-slate-400'}`}>
                <span className="font-medium">{label}</span>
                <span aria-hidden="true">/</span>
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
