import { getErrorMessage } from '../../utils/errors.js';

export function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex items-start justify-between gap-4">
      <p>{getErrorMessage(error)}</p>
      {onDismiss && (
        <button className="text-red-200 hover:text-white" onClick={onDismiss} type="button">
          Dismiss
        </button>
      )}
    </div>
  );
}
