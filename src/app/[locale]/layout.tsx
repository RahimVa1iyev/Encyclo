import { siteConfig } from '@/lib/config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SessionProvider } from '@/components/providers/session-provider';
import { locales } from '../../../next-intl.config';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
});

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: {
      languages: {
        'az': '${siteConfig.url}/az',
        'en': '${siteConfig.url}/en',
        'x-default': '${siteConfig.url}/az',
      }
    }
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) notFound();

  const messages = await getMessages();

  return (
    <div lang={locale} className={`${dmSans.variable} ${dmSans.className}`} style={{ scrollBehavior: 'smooth', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('encyclo-theme');if(!t||!['slate','indigo','ocean','forest'].includes(t))t='slate';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','slate');}})();`
        }}
      />
      <SessionProvider>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </SessionProvider>
    </div>
  );
}
