import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { matchService } from '../services/match.service';
import { leaderboardService } from '../services/leaderboard.service';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Loader, Skeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { MatchCard } from '../components/MatchCard';

function Hero() {
  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-700/60 to-ink-900/40 px-6 py-14 text-center sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-grid-glow opacity-70" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-neon-purple/20 blur-3xl animate-pulse-glow" />
      <div className="relative animate-fade-up">
        <p className="mb-3 inline-block rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan">
          Esports League · Season 2026
        </p>
        <h1 className="font-display text-4xl font-black leading-tight sm:text-6xl">
          🏆 <span className="text-gradient">BPL</span>{' '}
          <span className="text-gold drop-shadow-[0_0_18px_rgba(251,191,36,0.5)]">
            Bot Premiere League
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          8 elite players. 56 league matches over 14 days. One champion. Track every kill, headshot
          and win on the road to the playoffs.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/matches" className="btn-neon">
            View Schedule
          </Link>
          <Link to="/leaderboard" className="btn-ghost">
            🏅 Leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const summary = useApi(() => matchService.getSummary(), []);
  const leaderboard = useApi(() => leaderboardService.get(), []);
  const upcoming = useApi(() => matchService.getUpcoming(4), []);
  const playoffs = useApi(() => matchService.getPlayoffs(), []);

  const champion = playoffs.data?.find((m) => m.round === 'Final' && m.status === 'completed')?.winner;

  return (
    <div>
      <Hero />

      {champion && (
        <section className="mb-8 animate-fade-up rounded-3xl border border-neon-gold/40 bg-gradient-to-r from-neon-gold/10 via-amber-500/5 to-transparent p-6 text-center shadow-neon-gold">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-gold">Champion</p>
          <p className="mt-2 font-display text-3xl font-black text-gold sm:text-4xl">
            🏆 {champion}
          </p>
          <p className="mt-1 text-sm text-slate-300">BPL — Bot Premiere League winner</p>
        </section>
      )}

      {/* Stat cards */}
      {summary.error ? (
        <ErrorState message={summary.error} onRetry={summary.refetch} />
      ) : summary.loading || !summary.data ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Players" value={summary.data.totalPlayers} icon="👥" accent="purple" />
          <StatCard label="Total Matches" value={summary.data.totalMatches} icon="🎮" accent="cyan" />
          <StatCard
            label="Completed"
            value={summary.data.matchesCompleted}
            icon="✅"
            accent="green"
          />
          <StatCard
            label="Upcoming"
            value={summary.data.upcomingMatches}
            icon="⏳"
            accent="gold"
          />
        </div>
      )}

      {/* Leaderboard + Upcoming */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">🏅 Current Leaderboard</h2>
            <Link to="/leaderboard" className="text-sm text-neon-cyan hover:underline">
              View all →
            </Link>
          </div>
          {leaderboard.error ? (
            <ErrorState message={leaderboard.error} onRetry={leaderboard.refetch} />
          ) : leaderboard.loading || !leaderboard.data ? (
            <Skeleton className="h-72" />
          ) : (
            <LeaderboardTable rows={leaderboard.data} />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">⏭ Upcoming</h2>
            <Link to="/matches" className="text-sm text-neon-cyan hover:underline">
              All →
            </Link>
          </div>
          {upcoming.error ? (
            <ErrorState message={upcoming.error} onRetry={upcoming.refetch} />
          ) : upcoming.loading || !upcoming.data ? (
            <Loader label="Loading matches" />
          ) : upcoming.data.length === 0 ? (
            <GlassCard className="p-6 text-center text-slate-400">
              All matches completed — see you in the playoffs! 🏆
            </GlassCard>
          ) : (
            <div className="flex flex-col gap-4">
              {upcoming.data.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
