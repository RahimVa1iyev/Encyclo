import { siteConfig } from '@/lib/config';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.auth.login' });
  
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: {
        'az': `${siteConfig.url}/az`,
        'en': `${siteConfig.url}/en`,
      }
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${siteConfig.url}/${locale}`,
      siteName: 'Encyclo',
      locale: locale === 'az' ? 'az_AZ' : 'en_US',
      alternateLocale: locale === 'az' ? ['en_US'] : ['az_AZ'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
