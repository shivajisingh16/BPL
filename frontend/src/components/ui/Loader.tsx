import { Spinner } from './Spinner';

/** Full-section loading state with a friendly label. */
export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400 animate-fade-in">
      <Spinner className="h-10 w-10" />
      <p className="font-display tracking-widest text-sm uppercase">{label}</p>
    </div>
  );
}

/** Rectangular shimmer placeholder used while data loads. */
export function Skeleton({ className = 'h-24 w-full' }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}
