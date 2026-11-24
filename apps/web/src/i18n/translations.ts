import common from './locales/en/common.json';
import status from './locales/en/status.json';
import table from './locales/en/table.json';
import validation from './locales/en/validation.json';
import emptyState from './locales/en/emptyState.json';
import alert from './locales/en/alert.json';
import nav from './locales/en/nav.json';
import topbar from './locales/en/topbar.json';
import notFound from './locales/en/notFound.json';
import pages from './locales/en/pages.json';
import demo from './locales/en/demo.json';
import layout from './locales/en/layout.json';
import domain from './locales/en/domain.json';
import dashboard from './locales/en/dashboard.json';
import alerts from './locales/en/alerts.json';
import stocktaking from './locales/en/stocktaking.json';
import settings from './locales/en/settings.json';
import products from './locales/en/products.json';
import masterData from './locales/en/masterData.json';
import stockOps from './locales/en/stockOps.json';
import reports from './locales/en/reports.json';
import usersRbac from './locales/en/usersRbac.json';
import auth from './locales/en/auth.json';
import landing from './locales/en/landing.json';
import onboarding from './locales/en/onboarding.json';
import members from './locales/en/members.json';
import { loadLocale } from './loadLocale';
import { SUPPORTED_LANGUAGES, type Language } from './languages';

export type { Language } from './languages';
export const english = { common, status, table, validation, emptyState, alert, nav, topbar, notFound, pages, demo, layout, domain, dashboard, alerts, stocktaking, settings, products, masterData, stockOps, reports, usersRbac, auth, landing, onboarding, members } as const;
export const translations = Object.fromEntries(
  SUPPORTED_LANGUAGES.map(({ code }) => [code, code === 'en' ? english : loadLocale(code)])
) as Record<Language, typeof english>;

type NestedKeyOf<T extends Record<string, unknown>> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${NestedKeyOf<T[K]>}` : K;
}[keyof T & string];
export type TranslationKey = NestedKeyOf<typeof english>;
