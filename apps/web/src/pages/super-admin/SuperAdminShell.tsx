import type { LucideIcon } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import type React from 'react';

interface SuperAdminShellProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const SuperAdminShell = ({ eyebrow, title, description, icon: Icon, children, action }: SuperAdminShellProps) => (
  <div className="px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
        <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_320px] xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-ink">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">{description}</p>
          </div>
          <article className="rounded-lg border border-ocean/10 bg-sky p-5">
            <Icon className="text-ocean" size={28} />
            <p className="mt-4 text-sm font-bold text-ink">Accès super admin</p>
            <p className="mt-1 text-sm text-ink/55">Vue séparée des espaces scolaires</p>
            {action ? <div className="mt-5">{action}</div> : <ShieldCheck className="mt-5 text-canopy" size={22} />}
          </article>
        </div>
      </section>
      {children}
    </div>
  </div>
);
