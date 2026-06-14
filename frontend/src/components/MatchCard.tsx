import type { Match } from '../types';
import { GlassCard } from './ui/GlassCard';
import { StatusBadge } from './ui/Badge';

function PlayerSide({ name, isWinner, align }: { name: string; isWinner: boolean; align: 'left' | 'right' }) {
  return (
    <div className={`min-w-0 flex-1 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <p
        className={`truncate font-display text-sm font-semibold sm:text-base ${
          isWinner ? 'text-neon-gold' : 'text-slate-200'
        }`}
        title={name}
      >
        {isWinner && '👑 '}
        {name}
      </p>
    </div>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const completed = match.status === 'completed';
  const p1Won = completed && match.winner === match.player1;
  const p2Won = completed && match.winner === match.player2;

  return (
    <GlassCard interactive className="p-4 sm:p-5 animate-fade-up">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {match.round ?? `Match #${match.id}`}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center gap-2">
        <PlayerSide name={match.player1} isWinner={p1Won} align="left" />
        <span className="shrink-0 px-0.5 font-display text-xs font-bold text-neon-purple sm:text-sm">
          VS
        </span>
        <PlayerSide name={match.player2} isWinner={p2Won} align="right" />
      </div>

      {completed ? (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
          <PlayerResult
            name={match.player1}
            kills={match.player1Kills ?? 0}
            headshots={match.player1Headshots ?? 0}
            won={p1Won}
          />
          <PlayerResult
            name={match.player2}
            kills={match.player2Kills ?? 0}
            headshots={match.player2Headshots ?? 0}
            won={p2Won}
            align="right"
          />
        </div>
      ) : match.status === 'abandoned' ? (
        <div className="mt-4 border-t border-white/10 pt-3 text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-amber-300">
            ⊘ Abandoned · 1 pt each
          </span>
        </div>
      ) : (
        <div className="mt-4 border-t border-white/10 pt-3 text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-neon-cyan/80">
            ◷ Scheduled
          </span>
        </div>
      )}
    </GlassCard>
  );
}

function PlayerResult({
  name,
  kills,
  headshots,
  won,
  align = 'left',
}: {
  name: string;
  kills: number;
  headshots: number;
  won: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <p
        className={`truncate text-[10px] font-semibold uppercase tracking-wider ${
          won ? 'text-neon-gold' : 'text-slate-500'
        }`}
        title={name}
      >
        {won && '👑 '}
        {name}
      </p>
      <p className="mt-0.5 font-display text-sm font-bold text-white">
        <span className="text-neon-purple">{kills}</span> K ·{' '}
        <span className="text-neon-cyan">{headshots}</span> HS
      </p>
    </div>
  );
}
