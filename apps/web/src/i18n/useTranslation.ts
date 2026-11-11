import { useContext } from 'react';
import { I18nContext } from './context';
import type { I18nContextValue } from './context';
import type { Language } from './translations';
import { translateKey } from './translate';

/**
 * Returns the active language from I18nProvider, or a caller-provided default
 * when a hook runs standalone in isolated unit tests.
 */
export const useHookLanguage = (fallbackLanguage: Language = 'vi'): Language => {
  const context = useContext(I18nContext);
  return context?.language ?? fallbackLanguage;
};

export const useTranslation = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    // Safe fallback when used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) =>
        translateKey('en', key, params),
    };
  }
  return context;
};
