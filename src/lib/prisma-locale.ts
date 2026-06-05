import { prisma } from '@/lib/db';

// Use in include clauses to filter translations by locale
export function withTranslation(locale: string) {
  return { where: { locale } };
}

// Fallback: if requested locale not found, return 'az'
export function getTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
  fallback = 'az'
): T | undefined {
  return (
    translations.find(t => t.locale === locale) ??
    translations.find(t => t.locale === fallback)
  );
}
