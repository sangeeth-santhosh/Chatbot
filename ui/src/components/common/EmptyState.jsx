export function EmptyState({ title, body }) {
  return (
    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-slate-400 px-4 sm:px-6">
      <h2 className="text-base font-medium text-slate-200 max-w-lg">{title}</h2>
      {body && <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">{body}</p>}
    </div>
  );
}
