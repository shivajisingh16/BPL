import { GlassCard } from './GlassCard';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Reusable error panel with an optional retry action. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <GlassCard className="mx-auto my-12 max-w-lg p-8 text-center animate-fade-in">
      <div className="mb-3 text-4xl">⚠️</div>
      <h3 className="mb-2 text-lg font-display text-red-300">Something went wrong</h3>
      <p className="mb-5 text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button type="button" className="btn-ghost" onClick={onRetry}>
          ↻ Try again
        </button>
      )}
    </GlassCard>
  );
}
