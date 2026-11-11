import en from './locales/en.json';
import vi from './locales/vi.json';

export type Language = 'en' | 'vi';

export const translations = {
  en,
  vi,
} as const;

type NestedKeyOf<ObjectType extends Record<string, unknown>> = {
  [Key in keyof ObjectType & string]: ObjectType[Key] extends Record<string, unknown>
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : Key;
}[keyof ObjectType & string];

export type TranslationKey = NestedKeyOf<typeof en>;
