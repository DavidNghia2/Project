import { useContext } from 'react';
import { I18nContext } from './context';
import type { I18nContextValue } from './context';
import { translations } from './translations';

export const useTranslation = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    // Safe fallback when used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) => {
        const parts = key.split('.');
        let currentVal: unknown = translations.en;
        for (const part of parts) {
          if (currentVal && typeof currentVal === 'object' && part in currentVal) {
            currentVal = (currentVal as Record<string, unknown>)[part];
          } else {
            currentVal = undefined;
            break;
          }
        }
        if (typeof currentVal !== 'string') return key;
        let result = currentVal;
        if (params) {
          for (const [paramKey, paramVal] of Object.entries(params)) {
            result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
          }
        }
        return result;
      },
    };
  }
  return context;
};
