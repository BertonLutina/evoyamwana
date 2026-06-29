import type { Locale } from '@evoyamwana/shared';
import { Languages } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

interface LanguageSelectProps {
  className?: string;
}

export const LanguageSelect = ({ className = '' }: LanguageSelectProps) => {
  const { locale, localeNames, setLocale, t } = useLocale();

  return (
    <label className={`flex h-10 items-center gap-2 rounded-md border border-ocean/10 bg-white px-3 text-sm font-semibold text-ink ${className}`}>
      <Languages size={17} className="text-ember" />
      <span className="sr-only">{t('common.language')}</span>
      <select
        className="bg-transparent text-sm font-semibold outline-none"
        value={locale}
        aria-label={t('common.language')}
        onChange={(event) => setLocale(event.target.value as Locale)}
      >
        {Object.entries(localeNames).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
};
