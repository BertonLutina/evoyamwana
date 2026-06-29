import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, className = '', ...props }: InputProps) => {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span className="text-[0.82rem]">{label}</span>
      <input
        className={`h-[54px] rounded-lg border border-ink/10 bg-white/88 px-4 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] outline-none transition placeholder:text-ink/35 hover:border-ocean/35 focus:border-ocean focus:ring-4 focus:ring-ocean/10 ${className}`}
        {...props}
      />
    </label>
  );
};
