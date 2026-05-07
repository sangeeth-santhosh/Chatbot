export function TypingIndicator({ users }) {
  if (!users.length) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-2 text-xs text-slate-400">
      {users.map((user) => user.name).join(', ')} {users.length === 1 ? 'is' : 'are'} typing...
    </div>
  );
}
