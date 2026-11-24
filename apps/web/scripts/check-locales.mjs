import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/i18n/locales');
const manifest = fs.readFileSync(path.resolve('src/i18n/languages.ts'), 'utf8');
const languages = [...manifest.matchAll(/code:\s*'([^']+)'/g)].map((match) => match[1]);
if (!languages.includes('en')) throw new Error('The language registry must include English');
const flatten = (value, prefix = '', result = {}) => {
  for (const [key, child] of Object.entries(value)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') result[full] = child;
    else if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, full, result);
    else throw new Error(`Invalid translation value at ${full}`);
  }
  return result;
};
const read = (language) => {
  const result = {};
  for (const file of fs.readdirSync(path.join(root, language)).filter((name) => name.endsWith('.json'))) {
    const feature = file.slice(0, -5);
    result[feature] = JSON.parse(fs.readFileSync(path.join(root, language, file), 'utf8'));
  }
  return flatten(result);
};
const placeholders = (value) => [...new Set(value.match(/\{[a-zA-Z0-9_]+\}/g) ?? [])].sort().join(',');
const reference = read('en');
const errors = [];
// Values that intentionally remain identical: names, identifiers, symbols, and loanwords.
const sharedValues = {
  'auth.emailPlaceholder': 'name@company.com',
  'common.notAvailable': '—',
  'demo.togglePillVi': 'Tiếng Việt (VI)',
  'demo.togglePillEn': 'English (EN)',
  'landing.hero.frameTitle': 'smart-inventory · ledger-pulse',
  'layout.brandName': 'Smart Inventory',
  'layout.brandSub': 'Enterprise v1.0',
  'layout.version': 'v1.0.0-rc',
  'notFound.code': '404',
  'products.kpi.totalItemsUnit': '{count} SKUs',
  'products.form.imagePlaceholder': 'https://images.unsplash.com/...',
  'reports.table.cols.sku': 'SKU',
  'reports.csv.skuCount': '{count} SKU',
  'reports.csv.cols.sku': 'SKU',
  'usersRbac.form.emailLabel': 'Email',
  'usersRbac.form.emailPlaceholder': 'staff.name@smartinventory.local',
};
for (const language of languages) {
  const current = read(language);
  for (const key of Object.keys(reference)) {
    if (!(key in current)) errors.push(`${language}: missing ${key}`);
    else if (!current[key].trim()) errors.push(`${language}: empty ${key}`);
    else if (placeholders(current[key]) !== placeholders(reference[key])) errors.push(`${language}: placeholder mismatch ${key}`);
    else if (language !== 'en' && current[key] === reference[key] && sharedValues[key] !== current[key]) {
      errors.push(`${language}: untranslated value at ${key}`);
    }
  }
  for (const key of Object.keys(current)) {
    if (!(key in reference)) errors.push(`${language}: extra ${key}`);
  }
  const sameAsEnglish = language === 'en' ? 0 : Object.keys(reference).filter((key) => current[key] === reference[key]).length;
  console.log(`${language}: ${Object.keys(current).length} keys${language === 'en' ? '' : `, ${sameAsEnglish} values match English`}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
