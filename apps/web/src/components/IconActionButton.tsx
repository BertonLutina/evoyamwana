import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  tone?: 'blue' | 'green' | 'red' | 'neutral';
}

const tones = {
  blue: 'bg-sky text-ocean hover:bg-ocean hover:text-white',
  green: 'bg-canopy/10 text-canopy hover:bg-canopy hover:text-white',
  red: 'bg-clay/10 text-clay hover:bg-clay hover:text-white',
  neutral: 'bg-ink/8 text-ink/70 hover:bg-ink hover:text-white'
};

export const IconActionButton = ({ icon: Icon, label, tone = 'blue', className = '', ...props }: IconActionButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-grid h-10 w-10 place-items-center rounded-lg text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    {...props}
  >
    <Icon size={18} aria-hidden="true" />
  </button>
);
