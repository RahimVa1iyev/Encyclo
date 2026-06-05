export const siteConfig = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  name: 'Encyclo',
  ogImage: '/og-default.png',
} as const;
