export function LoadingScreen() {
  return (
    <div
      className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-sm text-slate-400"
      role="status"
      aria-label="Loading application"
    >
      <div className="flex items-center gap-3">
        <div
          className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
          aria-hidden="true"
        />
        Loading...
      </div>
    </div>
  );
}
