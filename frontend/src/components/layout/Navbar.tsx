import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/matches', label: 'Matches' },
  { to: '/stats', label: 'Player Stats' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

function linkClass({ isActive }: { isActive: boolean }): string {
  return [
    'relative px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors',
    isActive ? 'text-white' : 'text-slate-400 hover:text-white',
    'after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-neon-purple after:to-neon-cyan after:transition-transform',
    isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
  ].join(' ');
}

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="text-2xl">🏆</span>
          <span className="font-display text-lg font-bold leading-none">
            <span className="text-gradient">BPL</span>{' '}
            <span className="text-gold hidden sm:inline">Bot Premiere League</span>
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <div className="mx-2 h-6 w-px bg-white/10" />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NavLink to="/admin" className={linkClass}>
                ⚙ Admin
              </NavLink>
              <span className="hidden text-xs text-slate-500 lg:inline">{user?.email}</span>
              <button className="btn-ghost px-3 py-1.5 text-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn-neon px-4 py-1.5 text-sm">
              Admin Login
            </NavLink>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg border border-white/10 p-2 text-slate-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-ink-800/95 px-4 py-3 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            <div className="my-2 h-px bg-white/10" />
            {isAuthenticated ? (
              <>
                <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                  ⚙ Admin
                </NavLink>
                <button className="btn-ghost mt-2 w-full" onClick={handleLogout}>
                  Logout ({user?.email})
                </button>
              </>
            ) : (
              <NavLink to="/login" className="btn-neon mt-1 w-full" onClick={() => setOpen(false)}>
                Admin Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
