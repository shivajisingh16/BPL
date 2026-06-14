import type { PlayoffMatch } from '../types';
import { GlassCard } from './ui/GlassCard';
import { StatusBadge } from './ui/Badge';

const ROUND_META: Record<string, { icon: string; blurb: string }> = {
  'Qualifier 1': { icon: '①', blurb: 'Rank 1 vs Rank 2 — winner goes straight to the Final' },
  Eliminator: { icon: '⚔', blurb: 'Rank 3 vs Rank 4 — loser is knocked out' },
  'Qualifier 2': { icon: '②', blurb: 'Loser of Q1 vs Winner of Eliminator' },
  Final: { icon: '🏆', blurb: 'Winner Q1 vs Winner Q2 — for the title' },
};

function Side({
  name,
  label,
  resolved,
  isWinner,
}: {
  name: string;
  label: string;
  resolved: boolean;
  isWinner: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
        isWinner
          ? 'border-neon-gold/40 bg-neon-gold/10'
          : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <span
        className={`min-w-0 truncate font-display text-sm font-semibold ${
          isWinner ? 'text-neon-gold' : resolved ? 'text-white' : 'text-slate-500'
        }`}
        title={resolved ? name : label}
      >
        {isWinner && '👑 '}
        {resolved ? name : label}
      </span>
    </div>
  );
}

function PlayoffCard({ match }: { match: PlayoffMatch }) {
  const meta = ROUND_META[match.round] ?? { icon: '•', blurb: '' };
  const completed = match.status === 'completed';
  const p1Win = completed && match.winner === match.player1;
  const p2Win = completed && match.winner === match.player2;
  const isFinal = match.round === 'Final';

  return (
    <GlassCard
      interactive
      className={`p-4 animate-fade-up ${isFinal ? 'ring-1 ring-neon-gold/40 shadow-neon-gold' : ''}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-sm font-bold tracking-wide text-white">
          <span className="mr-1.5">{meta.icon}</span>
          {match.round}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="space-y-2">
        <Side name={match.player1} label={match.slot1Label} resolved={match.ready} isWinner={p1Win} />
        <div className="text-center text-[10px] font-bold uppercase tracking-widest text-neon-purple">
          vs
        </div>
        <Side name={match.player2} label={match.slot2Label} resolved={match.ready} isWinner={p2Win} />
      </div>

      {completed ? (
        <p className="mt-3 border-t border-white/10 pt-2 text-center text-xs text-slate-400">
          🏆 <span className="text-neon-gold">{match.winner}</span> · {match.kills} K · {match.headshots} HS
        </p>
      ) : (
        <p className="mt-3 border-t border-white/10 pt-2 text-center text-[11px] text-slate-500">
          {match.ready ? meta.blurb : 'Awaiting qualification…'}
        </p>
      )}
    </GlassCard>
  );
}

export function PlayoffBracket({ matches }: { matches: PlayoffMatch[] }) {
  const byRound = (round: string) => matches.filter((m) => m.round === round);
  const q1 = byRound('Qualifier 1');
  const elim = byRound('Eliminator');
  const q2 = byRound('Qualifier 2');
  const final = byRound('Final');

  return (
    <div className="grid gap-5 lg:grid-cols-3 lg:items-center">
      {/* Round 1 */}
      <div className="space-y-5">
        {q1.map((m) => (
          <PlayoffCard key={m.id} match={m} />
        ))}
        {elim.map((m) => (
          <PlayoffCard key={m.id} match={m} />
        ))}
      </div>
      {/* Round 2 */}
      <div className="space-y-5">
        {q2.map((m) => (
          <PlayoffCard key={m.id} match={m} />
        ))}
      </div>
      {/* Final */}
      <div className="space-y-5">
        {final.map((m) => (
          <PlayoffCard key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}
