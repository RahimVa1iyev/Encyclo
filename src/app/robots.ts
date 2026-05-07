export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/',
    },
    sitemap: 'https://encyclo.az/sitemap.xml',
  }
}
