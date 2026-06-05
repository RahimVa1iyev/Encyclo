export const locales = ['az', 'en'] as const;
export const defaultLocale = 'az' as const;
export type Locale = typeof locales[number];
