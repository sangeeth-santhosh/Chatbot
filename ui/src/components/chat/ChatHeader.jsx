export function ChatHeader({ chat }) {
  const participantsText = chat?.participants.map((participant) => participant.name).join(', ') || '';

  return (
    <header className="border-b border-slate-800 bg-[#0f1623] px-4 py-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-wide text-slate-500">Active room</p>
        <h1 className="mt-1 truncate text-lg font-semibold text-white" title={chat?.prompt}>
          {chat?.prompt || 'No room selected'}
        </h1>
        {chat && (
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">Participants</p>
              <p className="truncate text-sm text-slate-300" title={participantsText}>
                {participantsText}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  chat.status === 'available'
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
                aria-label={`Room status: ${chat.status}`}
              />
              <span className="text-xs text-slate-400 capitalize">{chat.status}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
