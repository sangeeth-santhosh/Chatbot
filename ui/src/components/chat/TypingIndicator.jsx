const TypingIndicator = ({ users }) => {
  const typingUsers = Array.isArray(users) ? users : users ? Object.values(users) : [];

  if (!typingUsers.length) return null;

  const userNames = typingUsers.map((user) => user.name || 'Someone').join(', ');
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
