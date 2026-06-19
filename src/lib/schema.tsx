import React from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://encycloai.com'

// HTML tag-larını silmək, yeni sətirləri və artıq boşluqları təmizləmək və 500 xarakterə kəsmək üçün
function cleanDescription(text: string): string {
  if (!text) return ''
  let cleaned = text.replace(/<[^>]*>?/gm, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
  if (cleaned.length > 500) {
    cleaned = cleaned.substring(0, 500)
    const lastSpace = cleaned.lastIndexOf(' ')
    if (lastSpace > 400) {
      cleaned = cleaned.substring(0, lastSpace)
    }
    cleaned += '...'
  }
  return cleaned
}

export interface ExtractedFAQ {
  question: string
  answer: string
}

export function extractFAQsFromDescription(description: string): ExtractedFAQ[] {
  if (!description) return []

  const paragraphs = description.split(/\n\s*\n/)
  const faqs: ExtractedFAQ[] = []

  for (const p of paragraphs) {
    const lines = p.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length >= 2 && lines[0].endsWith('?')) {
      let question = lines[0]
      let answer = lines.slice(1).join(' ')
      
      question = question.replace(/<[^>]*>?/gm, '').trim()
      answer = answer.replace(/<[^>]*>?/gm, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()

      if (question && answer.length >= 20) {
        faqs.push({
          question: question.length > 200 ? question.substring(0, 200) + '...' : question,
          answer: answer.length > 1000 ? answer.substring(0, 1000) + '...' : answer
        })
      }
    }
  }

  const uniqueFaqs: ExtractedFAQ[] = []
  const seen = new Set<string>()
  for (const faq of faqs) {
    const key = faq.question.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      uniqueFaqs.push(faq)
    }
  }

  return uniqueFaqs
}

export function generateProductSchema(product: any, company: any, category: any, locale = 'az') {
  if (!product) return null
  
  const translation = product.translations?.find((t: any) => t.locale === locale) || product.translations?.[0]
  if (!translation) return null

  const companyTranslation = company?.translations?.find((t: any) => t.locale === locale) || company?.translations?.[0]

  const description = cleanDescription(translation.description || '')
  const images = product.images && product.images.length > 0 ? product.images : undefined

  const schema: Record<string, any> = {
    "@type": product.type === 'service' ? 'Service' : 'Product',
    "name": translation.name,
    "url": `${SITE_URL}/products/${product.slug}`,
    "inLanguage": locale,
  }

  if (description) {
    schema.description = description
  }

  if (images) {
    schema.image = images
  }

  if (category?.name) {
    schema.category = category.name
  }

  if (companyTranslation?.name) {
    schema.brand = {
      "@type": "Organization",
      "name": companyTranslation.name,
    }
    if (company?.website) {
      schema.brand.url = company.website
    }
  }

  if (translation.features?.price) {
    schema.offers = {
      "@type": "Offer",
      "price": String(translation.features.price),
      "priceCurrency": translation.features.currency || "AZN",
      "availability": product.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `${SITE_URL}/products/${product.slug}`
    }
  }

  return schema
}

export function generateOrganizationSchema(company: any, category: any, locale = 'az') {
  if (!company) return null

  const translation = company.translations?.find((t: any) => t.locale === locale) || company.translations?.[0]
  if (!translation) return null

  const description = cleanDescription(translation.description || '')

  const schema: Record<string, any> = {
    "@type": "Organization",
    "name": translation.name,
    "url": company.website || `${SITE_URL}/companies/${company.slug}`,
    "inLanguage": locale,
  }

  if (description) {
    schema.description = description
  }

  if (company.logo_url) {
    schema.logo = company.logo_url
  }

  if (company.website) {
    schema.sameAs = [company.website]
  }

  return schema
}

export function generateFAQSchema(forumFaqs: any[], descriptionFaqs?: ExtractedFAQ[]) {
  const forumItems = (forumFaqs || [])
    .filter(f => f.is_faq === true && f.question && f.content)
    .map(f => ({
      question: f.question.replace(/<[^>]*>?/gm, '').trim(),
      answer: f.content.replace(/<[^>]*>?/gm, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
    }))

  const descItems = descriptionFaqs || []
  
  const allFaqs = [...forumItems, ...descItems]
  
  if (allFaqs.length === 0) return null

  const uniqueFaqs: any[] = []
  const seen = new Set<string>()
  for (const faq of allFaqs) {
    const key = faq.question.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      uniqueFaqs.push(faq)
    }
  }

  return {
    "@type": "FAQPage",
    "mainEntity": uniqueFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

export function generateWebSiteSchema() {
  return {
    "@type": "WebSite",
    "name": "Encyclo",
    "alternateName": "Azərbaycanın Biznes Ensiklopediyası",
    "url": SITE_URL,
    "inLanguage": "az",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/encyclopedia?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  if (!items || items.length === 0) return null

  return {
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  }
}

export function generateCollectionSchema(title: string, description: string, url: string, items: Array<{ name: string; url: string }>) {
  return {
    "@type": "CollectionPage",
    "name": title,
    "description": cleanDescription(description),
    "url": url.startsWith('http') ? url : `${SITE_URL}${url}`,
    "inLanguage": "az",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": items.length,
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "url": item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
      }))
    }
  }
}

export function renderSchemas(...schemas: (Record<string, any> | null)[]) {
  const valid = schemas.filter(Boolean)
  if (valid.length === 0) return null
  return valid.map((schema, i) => (
    <script
      key={`ld-json-${i}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...schema }) }}
    />
  ))
}
