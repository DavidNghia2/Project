# Web translations

The app supports `vi`, `zh-CN` (Simplified Chinese), and `en`. The language selector stores the choice in `smart_inventory_language` and sets the document's `lang` attribute. English is the default and the runtime fallback for missing keys.

Translations live in `locales/<language>/<feature>.json`. Keep the same feature filenames, key paths, and `{placeholder}` names in all three directories. When adding a feature file, import the English JSON in `translations.ts` and add it to `english`; `loadLocale.ts` loads the corresponding Vietnamese and Chinese files automatically. Call `t('feature.key')` in UI components. Literal keys are checked by TypeScript. For runtime-composed keys, use `TranslationKey` only after confirming all possible values exist. Use `getIntlLocale(language)` for locale-dependent dates and numbers.

To add a language, copy the English feature files into a new `locales/<language>` directory, translate the values, and register its code, native label, formatting locale, and text direction in `languages.ts`. The selector and the translation loader use the same list.

Run `npm run check:locales`, `npm run build`, and `npm test` after editing translations. The checker verifies keys and placeholders and rejects English text copied into another locale unless the exact shared value is listed in `check-locales.mjs`. Keep company names, email addresses, and other user data as entered. Translate interface labels and predefined business labels through the locale files.
