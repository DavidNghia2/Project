export const SUPPORTED_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', intlLocale: 'vi-VN', direction: 'ltr' },
  { code: 'zh-CN', label: '简体中文', intlLocale: 'zh-CN', direction: 'ltr' },
  { code: 'en', label: 'English', intlLocale: 'en-US', direction: 'ltr' },
] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export function isLanguage(value: string | null): value is Language {
  return SUPPORTED_LANGUAGES.some(({ code }) => code === value);
}

export function getIntlLocale(language: Language): string {
  return SUPPORTED_LANGUAGES.find(({ code }) => code === language)!.intlLocale;
}
