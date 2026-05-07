export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/onboarding/', '/widget/'],
    },
    sitemap: 'https://encyclo.az/sitemap.xml',
  }
}
