import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: 'blue' | 'orange' | 'green' | 'gold' | 'clay';
  detail?: string;
  trend?: string;
}

const tones = {
  blue: 'bg-ocean/10 text-ocean',
  orange: 'bg-ember/10 text-ember',
  green: 'bg-canopy/10 text-canopy',
  gold: 'bg-maize/25 text-earth',
  clay: 'bg-clay/10 text-clay'
};

export const StatCard = ({ label, value, icon: Icon, tone, detail, trend }: StatCardProps) => {
  return (
    <article className="group premium-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-ocean/20 hover:shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink/62">{label}</p>
        <span className={`grid h-11 w-11 place-items-center rounded-lg transition group-hover:scale-105 ${tones[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-5 font-display text-3xl font-black text-ink">{value}</p>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        {detail ? <span className="text-ink/55">{detail}</span> : <span />}
        {trend ? <span className="rounded-full bg-sky px-2 py-1 font-semibold text-ocean">{trend}</span> : null}
      </div>
    </article>
  );
};
