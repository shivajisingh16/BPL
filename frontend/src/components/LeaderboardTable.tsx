import type { LeaderboardRow } from '../types';
import { GlassCard } from './ui/GlassCard';

function rankCell(rank: number) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  return (
    <span
      className={`font-display text-lg font-bold ${
        rank <= 3 ? 'text-neon-gold' : 'text-slate-400'
      }`}
    >
      {medal ?? `#${rank}`}
    </span>
  );
}

const HEADERS = ['Rank', 'Player', 'Pts', 'P', 'W', 'L', 'Ab', 'Kills', 'HS'];

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <GlassCard className="overflow-hidden animate-fade-up">
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400"
                  title={
                    h === 'P' ? 'Played' : h === 'Ab' ? 'Abandoned' : h === 'HS' ? 'Headshots' : undefined
                  }
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-white/5 transition-colors hover:bg-white/[0.04] ${
                  row.rank <= 3 ? 'bg-neon-gold/[0.04]' : ''
                }`}
              >
                <td className="px-3 py-3">{rankCell(row.rank)}</td>
                <td className="px-3 py-3 font-display font-semibold text-white">{row.name}</td>
                <td className="px-3 py-3 font-display text-base font-bold text-neon-gold">
                  {row.points}
                </td>
                <td className="px-3 py-3 text-slate-400">{row.played}</td>
                <td className="px-3 py-3 font-bold text-emerald-300">{row.wins}</td>
                <td className="px-3 py-3 text-red-300">{row.losses}</td>
                <td className="px-3 py-3 text-amber-300">{row.abandoned}</td>
                <td className="px-3 py-3 text-neon-purple">{row.kills}</td>
                <td className="px-3 py-3 text-neon-cyan">{row.headshots}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="divide-y divide-white/5 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 p-4">
            <div className="w-8 shrink-0">{rankCell(row.rank)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-display font-semibold text-white">{row.name}</p>
                <p className="shrink-0 font-display text-sm font-bold text-neon-gold">
                  {row.points} pts
                </p>
              </div>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                <span className="text-emerald-300">{row.wins}W</span>
                <span className="text-red-300">{row.losses}L</span>
                {row.abandoned > 0 && <span className="text-amber-300">{row.abandoned}Ab</span>}
                <span className="text-neon-purple">{row.kills} kills</span>
                <span className="text-neon-cyan">{row.headshots} hs</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
