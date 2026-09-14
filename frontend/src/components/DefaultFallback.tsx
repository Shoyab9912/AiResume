import type { FallbackProps } from './Errorboundary';
import { ErrorAlert } from "./ui/Feedback";

export const DefaultFallback = ({ error, onRetry }: FallbackProps) => (
  <div className="glass-card p-8 flex flex-col items-center gap-4 text-center max-w-lg mx-auto mt-20">
    <p className="font-semibold text-white/80">Something went wrong.</p>
    <ErrorAlert message={error?.message || "An unexpected error occurred."} />
    <button onClick={onRetry} className="btn-primary py-2.5 px-6 rounded-xl text-sm font-semibold">
      Try again
    </button>
  </div>
);
