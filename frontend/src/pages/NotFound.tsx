import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-up">
      <p className="font-display text-7xl font-black text-gradient">404</p>
      <p className="mt-3 text-lg text-slate-300">This match never made the schedule.</p>
      <Link to="/" className="btn-neon mt-6">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
