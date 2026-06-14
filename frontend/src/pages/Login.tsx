import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/ui/GlassCard';
import { Spinner } from '../components/ui/Spinner';
import { ApiError } from '../services/apiClient';

interface LocationState {
  from?: string;
}

export default function Login() {
  const { login, isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → skip the form.
  if (!initializing && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <GlassCard className="w-full max-w-md p-8 animate-fade-up">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🔐</div>
          <h1 className="font-display text-2xl font-bold">
            <span className="text-gradient">Admin Login</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to manage match results.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input-field"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <button type="submit" className="btn-neon w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner className="h-4 w-4" /> Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
