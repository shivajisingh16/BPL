import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
}

/** Consistent page title block with optional right-aligned actions. */
export function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {icon && <span className="mr-2">{icon}</span>}
          <span className="text-gradient">{title}</span>
        </h1>
        {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
