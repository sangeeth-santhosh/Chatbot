export function ChatHeader({ chat }) {
  const subtitle = chat?.user?.email || 'Active conversation';

  return (
    <header className="border-b border-slate-800 bg-[#0f1623] px-4 py-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-wide text-slate-500">{subtitle}</p>
        <h1 className="mt-1 truncate text-lg font-semibold text-white" title={chat?.title}>
          {chat?.title || 'No conversation selected'}
        </h1>
      </div>
    </header>
  );
}
