import type { PlayerStats } from '../types';
import { GlassCard } from './ui/GlassCard';

function rankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`font-display text-sm font-bold ${accent ?? 'text-white'}`}>{value}</span>
    </div>
  );
}

export function PlayerCard({ stats }: { stats: PlayerStats }) {
  const isTop3 = stats.rank <= 3;

  return (
    <GlassCard
      interactive
      className={`p-5 animate-fade-up ${isTop3 ? 'ring-1 ring-neon-gold/30' : ''}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-neon-violet to-neon-cyan font-display text-lg font-bold text-white shadow-neon-purple">
          {initials(stats.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold text-white" title={stats.name}>
            {stats.name}
          </p>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Win rate <span className="text-neon-cyan">{stats.winRate}%</span>
          </p>
        </div>
        <div
          className={`grid h-10 min-w-10 place-items-center rounded-lg px-2 font-display text-lg font-bold ${
            isTop3 ? 'text-neon-gold' : 'bg-white/5 text-slate-300'
          }`}
          title={`Rank ${stats.rank}`}
        >
          {rankBadge(stats.rank)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatRow label="Points" value={stats.points} accent="text-neon-gold" />
        <StatRow label="Played" value={stats.matchesPlayed} />
        <StatRow label="Wins" value={stats.wins} accent="text-emerald-300" />
        <StatRow label="Losses" value={stats.losses} accent="text-red-300" />
        <StatRow label="Abandoned" value={stats.abandoned} accent="text-amber-300" />
        <StatRow label="Win %" value={`${stats.winRate}%`} accent="text-white" />
        <StatRow label="Kills" value={stats.totalKills} accent="text-neon-purple" />
        <StatRow label="Headshots" value={stats.totalHeadshots} accent="text-neon-cyan" />
      </div>
    </GlassCard>
  );
}
