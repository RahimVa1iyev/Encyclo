import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from '../../next-intl.config';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale,
});
