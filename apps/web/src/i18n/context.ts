import { createContext } from 'react';
import type { Language, TranslationKey } from './translations';

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
