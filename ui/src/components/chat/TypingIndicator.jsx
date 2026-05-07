export function TypingIndicator({ users }) {
  if (!users.length) return null;

  const userNames = users.map((user) => user.name).join(', ');
  const typingText = users.length === 1 ? 'is' : 'are';

  return (
    <div
      className="mx-auto w-full max-w-4xl px-4 pb-2 text-xs text-slate-400"
      aria-live="polite"
      aria-label={`${userNames} ${typingText} typing`}
      role="status"
    >
      {userNames} {typingText} typing<span className="typing-dots">···</span>
    </div>
  );
}
