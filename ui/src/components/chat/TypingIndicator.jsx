import { useAuthStore } from '../../store/authStore.js';

const TypingIndicator = ({ users }) => {
  const viewer = useAuthStore((state) => state.user);
  const typingUsers = Array.isArray(users) ? users : users ? Object.values(users) : [];

  if (!typingUsers.length) return null;

  if (viewer?.role !== 'admin') {
    return (
      <div
        aria-label="Assistant is thinking"
        aria-live="polite"
        className="flex items-center gap-2 px-1 pb-3 text-xs text-zinc-400"
        role="status"
      >
        <span>Thinking</span>
        <span className="typing-dots">...</span>
      </div>
    );
  }

  const userNames = typingUsers
    .map((user) => user.email || user.name || 'User')
    .join(', ');
  const typingText = typingUsers.length === 1 ? 'is' : 'are';

  return (
    <div
      aria-label={`${userNames} ${typingText} typing`}
      aria-live="polite"
      className="px-1 pb-3 text-xs text-zinc-400"
      role="status"
    >
      {userNames} {typingText} typing<span className="typing-dots">...</span>
    </div>
  );
};

export default TypingIndicator;
