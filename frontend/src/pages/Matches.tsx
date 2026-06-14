import { useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { matchService } from '../services/match.service';
import { PageHeader } from '../components/ui/PageHeader';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { MatchCard } from '../components/MatchCard';
import { PlayoffBracket } from '../components/PlayoffBracket';
import type { MatchStatus } from '../types';

type Filter = 'all' | MatchStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
  { key: 'abandoned', label: 'Abandoned' },
];

export default function Matches() {
  const { data, loading, error, refetch } = useApi(() => matchService.getGroupedByDay(), []);
  const playoffs = useApi(() => matchService.getPlayoffs(), []);
  const [filter, setFilter] = useState<Filter>('all');

  const groups = useMemo(() => {
    if (!data) return [];
    return data
      .map((g) => ({
        ...g,
        matches: filter === 'all' ? g.matches : g.matches.filter((m) => m.status === filter),
      }))
      .filter((g) => g.matches.length > 0);
  }, [data, filter]);

  return (
    <div>
      <PageHeader
        title="Match Schedule"
        icon="🎮"
        subtitle="56 league matches across 14 days, then the playoffs."
        actions={
          <div className="flex flex-wrap rounded-xl border border-white/10 bg-ink-800/60 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  filter === f.key
                    ? 'bg-gradient-to-r from-neon-violet to-neon-purple text-white shadow-neon-purple'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      />

      {/* League */}
      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : loading || !data ? (
        <Loader label="Loading schedule" />
      ) : groups.length === 0 ? (
        <p className="py-16 text-center text-slate-400">No matches match this filter.</p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.day}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl font-bold text-white">Day {group.day}</h2>
                <span className="rounded-full border border-neon-purple/30 bg-neon-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neon-purple">
                  {group.stage}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.matches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Playoffs */}
      <section className="mt-14">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-bold text-gold">🏆 Playoffs</h2>
          <span className="rounded-full border border-neon-gold/30 bg-neon-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neon-gold">
            Knockout Stage
          </span>
        </div>
        {playoffs.error ? (
          <ErrorState message={playoffs.error} onRetry={playoffs.refetch} />
        ) : playoffs.loading || !playoffs.data ? (
          <Loader label="Loading bracket" />
        ) : (
          <PlayoffBracket matches={playoffs.data} />
        )}
      </section>
    </div>
  );
}
