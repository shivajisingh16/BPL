import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { matchService } from '../services/match.service';
import { PageHeader } from '../components/ui/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { StatusBadge } from '../components/ui/Badge';
import { MatchEditModal } from '../components/admin/MatchEditModal';
import type { Match, PlayoffMatch } from '../types';

type Editing = { match: Match; ready: boolean };

function resultText(m: Match): string {
  if (m.status === 'completed') {
    const winnerKills = (m.winner === m.player1 ? m.player1Kills : m.player2Kills) ?? 0;
    const winnerHeadshots =
      (m.winner === m.player1 ? m.player1Headshots : m.player2Headshots) ?? 0;
    return `🏆 ${m.winner} · ${winnerKills} K · ${winnerHeadshots} HS`;
  }
  if (m.status === 'abandoned') return '⊘ Abandoned · 1 pt each';
  return '—';
}

export default function Admin() {
  const { user } = useAuth();
  const league = useApi(() => matchService.getAll(), []);
  const playoffs = useApi(() => matchService.getPlayoffs(), []);

  const [matches, setMatches] = useState<Match[]>([]);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [dayFilter, setDayFilter] = useState<number | 'all'>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (league.data) setMatches(league.data);
  }, [league.data]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const days = useMemo(() => [...new Set(matches.map((m) => m.day))].sort((a, b) => a - b), [matches]);
  const decided = useMemo(
    () => matches.filter((m) => m.status === 'completed' || m.status === 'abandoned').length,
    [matches],
  );

  const visible = useMemo(
    () =>
      (dayFilter === 'all' ? matches : matches.filter((m) => m.day === dayFilter)).sort(
        (a, b) => a.day - b.day || a.id - b.id,
      ),
    [matches, dayFilter],
  );

  const handleSaved = (updated: Match) => {
    // League result → update the row in place. Either way the bracket may shift,
    // so always refresh the resolved playoffs from the server.
    if (updated.stage === 'league') {
      setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    }
    playoffs.refetch();
    setEditing(null);

    if (updated.status === 'completed') {
      setToast(`Saved · ${updated.winner} wins! Stats & standings updated.`);
    } else if (updated.status === 'abandoned') {
      setToast(`Match #${updated.id} abandoned · both players +1 point.`);
    } else {
      setToast(`Match #${updated.id} reset to scheduled.`);
    }
  };

  const openPlayoff = (m: PlayoffMatch) => setEditing({ match: m, ready: m.ready });
  const openLeague = (m: Match) => setEditing({ match: m, ready: true });

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        icon="⚙"
        subtitle={`Signed in as ${user?.email ?? 'admin'} · update results to recalculate stats, standings & the bracket.`}
        actions={
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Day
            <select
              className="input-field w-auto py-1.5"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {/* Progress */}
      {matches.length > 0 && (
        <GlassCard className="mb-6 p-4 animate-fade-up">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-300">League progress</span>
            <span className="text-slate-400">
              {decided} / {matches.length} decided
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-violet via-neon-purple to-neon-cyan transition-all duration-500"
              style={{ width: `${matches.length ? (decided / matches.length) * 100 : 0}%` }}
            />
          </div>
        </GlassCard>
      )}

      {/* League matches */}
      {league.error ? (
        <ErrorState message={league.error} onRetry={league.refetch} />
      ) : league.loading ? (
        <Loader label="Loading matches" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04]">
              <tr className="text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Match</th>
                <th className="hidden px-4 py-3 sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 md:table-cell">Result</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-slate-400">{m.day}</td>
                  <td className="px-4 py-3">
                    <span className="font-display font-semibold text-white">
                      {m.player1} <span className="text-neon-purple">vs</span> {m.player2}
                    </span>
                    <div className="sm:hidden">
                      <StatusBadge status={m.status} />
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-slate-300 md:table-cell">
                    {m.status === 'scheduled' ? (
                      <span className="text-slate-600">—</span>
                    ) : (
                      resultText(m)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => openLeague(m)}>
                      ✎ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Playoffs */}
      <h2 className="mb-4 mt-10 font-display text-xl font-bold text-gold">🏆 Playoffs</h2>
      {playoffs.error ? (
        <ErrorState message={playoffs.error} onRetry={playoffs.refetch} />
      ) : playoffs.loading || !playoffs.data ? (
        <Loader label="Loading bracket" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neon-gold/20">
          <table className="w-full text-left text-sm">
            <thead className="bg-neon-gold/[0.06]">
              <tr className="text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Round</th>
                <th className="px-4 py-3">Match</th>
                <th className="hidden px-4 py-3 sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 md:table-cell">Result</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {playoffs.data.map((m) => (
                <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-display font-semibold text-neon-gold">{m.round}</td>
                  <td className="px-4 py-3">
                    <span className={`font-display font-semibold ${m.ready ? 'text-white' : 'text-slate-500'}`}>
                      {m.player1} <span className="text-neon-purple">vs</span> {m.player2}
                    </span>
                    {!m.ready && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-400/80">
                        locked
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-slate-300 md:table-cell">{resultText(m)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => openPlayoff(m)}>
                      ✎ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <MatchEditModal
          match={editing.match}
          ready={editing.ready}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-up rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-3 text-sm font-medium text-emerald-200 shadow-neon-cyan backdrop-blur-xl">
          ✅ {toast}
        </div>
      )}
    </div>
  );
}
