import React, { useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import { type TranslationKey } from './translations';
import { isLanguage, SUPPORTED_LANGUAGES, type Language } from './languages';
import { translateKey } from './translate';
import { I18nContext } from './context';

const STORAGE_KEY = 'smart_inventory_language';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLanguage(saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage read errors in SSR/test
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = SUPPORTED_LANGUAGES.find((item) => item.code === language)!.direction;
  }, [language]);

  const t = useMemo(() => {
    return (key: TranslationKey | string, params?: Record<string, string | number>): string =>
      translateKey(language, key, params);
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
