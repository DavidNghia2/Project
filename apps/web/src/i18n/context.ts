import { createContext } from 'react';
import type { TranslationKey } from './translations';
import type { Language } from './languages';

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <K extends string>(
    key: string extends K ? K : K extends TranslationKey ? K : never,
    params?: Record<string, string | number>
  ) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
