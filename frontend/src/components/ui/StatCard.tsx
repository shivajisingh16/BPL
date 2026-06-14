import type { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

type Accent = 'purple' | 'cyan' | 'gold' | 'green';

const ACCENTS: Record<Accent, { value: string; glow: string; ring: string }> = {
  purple: { value: 'text-neon-purple', glow: 'shadow-neon-purple', ring: 'from-neon-purple/30' },
  cyan: { value: 'text-neon-cyan', glow: 'shadow-neon-cyan', ring: 'from-neon-cyan/30' },
  gold: { value: 'text-neon-gold', glow: 'shadow-neon-gold', ring: 'from-neon-gold/30' },
  green: { value: 'text-emerald-300', glow: '', ring: 'from-emerald-400/30' },
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: Accent;
}

/** Headline metric tile for the dashboard. */
export function StatCard({ label, value, icon, accent = 'purple' }: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <GlassCard interactive className="relative overflow-hidden p-5 animate-fade-up">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${a.ring} to-transparent blur-2xl`}
      />
      <div className="flex items-center justify-between">
        <p className="label mb-0">{label}</p>
        {icon && <span className="text-xl opacity-80">{icon}</span>}
      </div>
      <p className={`mt-3 font-display text-4xl font-bold ${a.value}`}>{value}</p>
    </GlassCard>
  );
}
