import type { ReactNode } from 'react';
import type { MatchStatus } from '../../types';

type Tone = 'cyan' | 'purple' | 'gold' | 'green' | 'amber' | 'slate';

const TONES: Record<Tone, string> = {
  cyan: 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30',
  purple: 'bg-neon-purple/15 text-neon-purple border border-neon-purple/30',
  gold: 'bg-neon-gold/15 text-neon-gold border border-neon-gold/30',
  green: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30',
  amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  slate: 'bg-white/5 text-slate-300 border border-white/10',
};

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`chip ${TONES[tone]}`}>{children}</span>;
}

/** Convenience badge for a match status. */
export function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === 'completed') return <Badge tone="green">● Completed</Badge>;
  if (status === 'abandoned') return <Badge tone="amber">⊘ Abandoned</Badge>;
  return <Badge tone="cyan">◷ Scheduled</Badge>;
}
