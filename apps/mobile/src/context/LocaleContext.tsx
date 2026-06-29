import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { localeNames, translate, type Locale, type TranslationKey } from '@evoyamwana/shared';

interface LocaleContextValue {
  locale: Locale;
  localeNames: typeof localeNames;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider = ({ children }: PropsWithChildren) => {
  const [locale, setLocale] = useState<Locale>('fr');

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      localeNames,
      setLocale,
      t: (key) => translate(locale, key)
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};
