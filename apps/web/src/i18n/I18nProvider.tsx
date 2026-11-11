import React, { useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from './translations';
import { I18nContext } from './context';

const STORAGE_KEY = 'smart_inventory_language';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') {
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

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'vi' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    return (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      const parts = key.split('.');
      let currentVal: unknown = translations[language];

      for (const part of parts) {
        if (currentVal && typeof currentVal === 'object' && part in currentVal) {
          currentVal = (currentVal as Record<string, unknown>)[part];
        } else {
          currentVal = undefined;
          break;
        }
      }

      // Fallback to English if translation is missing
      if (currentVal === undefined) {
        let fallbackVal: unknown = translations.en;
        for (const part of parts) {
          if (fallbackVal && typeof fallbackVal === 'object' && part in fallbackVal) {
            fallbackVal = (fallbackVal as Record<string, unknown>)[part];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        currentVal = fallbackVal;
      }

      if (typeof currentVal !== 'string') {
        return key;
      }

      let result = currentVal;
      if (params) {
        for (const [paramKey, paramVal] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        }
      }
      return result;
    };
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
