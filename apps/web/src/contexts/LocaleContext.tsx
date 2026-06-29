import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { localeNames, translate, type Locale, type TranslationKey } from '@evoyamwana/shared';

interface LocaleContextValue {
  locale: Locale;
  localeNames: typeof localeNames;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const storageKey = 'evoyamwana.locale';
const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const readInitialLocale = (): Locale => {
  const stored = localStorage.getItem(storageKey);
  return stored === 'sw' || stored === 'ln' || stored === 'fr' || stored === 'lua' || stored === 'kg' || stored === 'tll' ? stored : 'fr';
};

export const LocaleProvider = ({ children }: PropsWithChildren) => {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const value = useMemo<LocaleContextValue>(() => {
    const setLocale = (nextLocale: Locale) => {
      localStorage.setItem(storageKey, nextLocale);
      document.documentElement.lang = nextLocale;
      setLocaleState(nextLocale);
    };

    document.documentElement.lang = locale;

    return {
      locale,
      localeNames,
      setLocale,
      t: (key) => translate(locale, key)
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};
