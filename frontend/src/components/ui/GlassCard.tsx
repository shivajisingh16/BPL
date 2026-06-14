import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Adds hover lift + neon glow interactivity. */
  interactive?: boolean;
}

/** Reusable glassmorphism container. */
export function GlassCard({ children, interactive = false, className = '', ...rest }: GlassCardProps) {
  return (
    <div className={`glass ${interactive ? 'glass-hover' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}
