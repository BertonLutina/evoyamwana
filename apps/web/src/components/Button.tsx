import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const variants = {
  primary: 'bg-ocean text-white shadow-[0_16px_34px_rgba(0,127,255,0.24)] hover:bg-ink',
  secondary: 'bg-maize text-ink shadow-[0_14px_30px_rgba(247,214,24,0.22)] hover:bg-ember hover:text-white',
  ghost: 'bg-white/45 text-ink hover:bg-white/80'
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
