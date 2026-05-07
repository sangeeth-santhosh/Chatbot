export function ChatHeader({ chat }) {
  return (
    <header className="border-b border-slate-800 bg-[#0f1623] px-4 py-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-wide text-slate-500">Active room</p>
        <h1 className="mt-1 truncate text-lg font-semibold text-white">
          {chat?.prompt || 'No room selected'}
        </h1>
        {chat && (
          <p className="mt-1 truncate text-sm text-slate-400">
            Participants: {chat.participants.map((participant) => participant.name).join(', ')}
          </p>
        )}
      </div>
    </header>
  );
}
