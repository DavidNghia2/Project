import type { Language } from './languages';

const files = import.meta.glob<Record<string, unknown>>('./locales/*/*.json', {
  eager: true,
  import: 'default',
});

export function loadLocale(language: Language): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [path, content] of Object.entries(files)) {
    const match = path.match(/^\.\/locales\/([^/]+)\/([^/]+)\.json$/);
    if (match?.[1] === language) result[match[2]] = content;
  }
  return result;
}
