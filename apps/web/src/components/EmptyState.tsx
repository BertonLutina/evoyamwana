import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-ocean/20 bg-sky/60 px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-md bg-white text-ocean shadow-sm">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink/60">{description}</p>
    </div>
  );
};
