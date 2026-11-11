import { translateKey } from './translate';
import type { Language } from './translations';

export type DomainTranslationGroup =
  | 'warehouses'
  | 'warehouseNames'
  | 'regions'
  | 'parentGroups'
  | 'paymentTerms'
  | 'categories'
  | 'units'
  | 'departments';

/**
 * Translates preset master-data labels (warehouse names, product categories, units, regions,
 * parent industry groups, payment terms) while preserving canonical values for data filtering.
 */
export function translateDomainLabel(
  language: Language,
  group: DomainTranslationGroup,
  key: string,
  fallback?: string
): string {
  const fullKey = `domain.${group}.${key}`;
  const translated = translateKey(language, fullKey);
  return translated === fullKey ? (fallback ?? key) : translated;
}
