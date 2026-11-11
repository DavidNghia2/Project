import { translations, type Language } from './translations';

function resolvePath(root: unknown, parts: string[]): unknown {
  let current: unknown = root;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Resolves a dotted translation key for the given language, falling back to English,
 * and replaces `{param}` placeholders when supplied.
 */
export function translateKey(
  language: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const parts = key.split('.');
  let value = resolvePath(translations[language], parts);

  if (typeof value !== 'string') {
    value = resolvePath(translations.en, parts);
  }

  if (typeof value !== 'string') {
    return key;
  }

  if (!params) {
    return value;
  }

  return Object.entries(params).reduce(
    (acc, [paramKey, paramVal]) =>
      acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal)),
    value
  );
}
