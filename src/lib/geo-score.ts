export interface GeoScoreBreakdown {
  description: { score: number; max: 20; passed: boolean; detail: string }
  english: { score: number; max: 20; passed: boolean; detail: string }
  faq: { score: number; max: 15; passed: boolean; detail: string }
  images: { score: number; max: 10; passed: boolean; detail: string }
  features: { score: number; max: 10; passed: boolean; detail: string }
  metaTitle: { score: number; max: 10; passed: boolean; detail: string }
  recency: { score: number; max: 15; passed: boolean; detail: string }
}

export interface GeoScoreResult {
  totalScore: number
  maxScore: 100
  percentage: number
  level: 'low' | 'medium' | 'good' | 'excellent'
  breakdown: GeoScoreBreakdown
}

interface ProductForScoring {
  images: string[]
  created_at: string
  updated_at?: string
  translations?: Array<{
    locale: string
    name: string
    description?: string
    features?: {
      keywords?: string[]
      price?: number
      currency?: string
      price_type?: string
    }
    meta_title?: string
  }>
  faqCount?: number // forum_posts-dan is_faq=true sayı
}

export function calculateGeoScore(product: ProductForScoring): GeoScoreResult {
  const breakdown: GeoScoreBreakdown = {
    description: { score: 0, max: 20, passed: false, detail: '' },
    english: { score: 0, max: 20, passed: false, detail: '' },
    faq: { score: 0, max: 15, passed: false, detail: '' },
    images: { score: 0, max: 10, passed: false, detail: '' },
    features: { score: 0, max: 10, passed: false, detail: '' },
    metaTitle: { score: 0, max: 10, passed: false, detail: '' },
    recency: { score: 0, max: 15, passed: false, detail: '' },
  }

  // 1. Təsvir uzunluğu (20 bal)
  const azTranslation = product.translations?.find(t => t.locale === 'az')
  const descriptionWords = (azTranslation?.description || '').split(/\s+/).filter(w => w.length > 0).length
  if (descriptionWords >= 150) {
    breakdown.description = { score: 20, max: 20, passed: true, detail: `${descriptionWords} söz ✓` }
  } else if (descriptionWords >= 80) {
    breakdown.description = { score: 10, max: 20, passed: false, detail: `${descriptionWords}/150 söz — daha çox yazın` }
  } else {
    breakdown.description = { score: 0, max: 20, passed: false, detail: `${descriptionWords}/150 söz — çox qısadır` }
  }

  // 2. İngilis dili (20 bal)
  const enTranslation = product.translations?.find(t => t.locale === 'en')
  if (enTranslation?.name && enTranslation?.description && enTranslation.description.length > 50) {
    breakdown.english = { score: 20, max: 20, passed: true, detail: 'İngilis dili mövcuddur ✓' }
  } else if (enTranslation?.name) {
    breakdown.english = { score: 5, max: 20, passed: false, detail: 'Yalnız ad var — təsvir əlavə edin' }
  } else {
    breakdown.english = { score: 0, max: 20, passed: false, detail: 'İngilis dili yoxdur' }
  }

  // 3. FAQ (15 bal)
  const faqCount = product.faqCount || 0
  // Description-dakı sual sayını da hesabla
  const descQuestionCount = (azTranslation?.description || '').split('\n').filter(line => line.trim().endsWith('?')).length
  const totalFaq = Math.max(faqCount, descQuestionCount)
  
  if (totalFaq >= 3) {
    breakdown.faq = { score: 15, max: 15, passed: true, detail: `${totalFaq} sual-cavab ✓` }
  } else if (totalFaq >= 1) {
    breakdown.faq = { score: 7, max: 15, passed: false, detail: `${totalFaq}/3 sual — daha çox əlavə edin` }
  } else {
    breakdown.faq = { score: 0, max: 15, passed: false, detail: 'FAQ yoxdur' }
  }

  // 4. Şəkil (10 bal)
  if (product.images && product.images.length >= 1) {
    breakdown.images = { score: 10, max: 10, passed: true, detail: `${product.images.length} şəkil ✓` }
  } else {
    breakdown.images = { score: 0, max: 10, passed: false, detail: 'Şəkil yoxdur' }
  }

  // 5. Qiymət + Keywords (10 bal)
  const features = azTranslation?.features
  const hasPrice = features?.price !== undefined && features?.price !== null
  const hasKeywords = features?.keywords && features.keywords.length >= 1
  if (hasPrice && hasKeywords) {
    breakdown.features = { score: 10, max: 10, passed: true, detail: 'Qiymət və açar sözlər ✓' }
  } else if (hasPrice || hasKeywords) {
    breakdown.features = { score: 5, max: 10, passed: false, detail: hasPrice ? 'Açar sözlər əlavə edin' : 'Qiymət əlavə edin' }
  } else {
    breakdown.features = { score: 0, max: 10, passed: false, detail: 'Qiymət və açar sözlər yoxdur' }
  }

  // 6. Meta title (10 bal)
  const metaTitle = azTranslation?.meta_title
  if (metaTitle && metaTitle.length >= 10) {
    breakdown.metaTitle = { score: 10, max: 10, passed: true, detail: 'Meta başlıq ✓' }
  } else {
    breakdown.metaTitle = { score: 0, max: 10, passed: false, detail: 'Meta başlıq yoxdur' }
  }

  // 7. Yenilik (15 bal)
  const lastUpdate = product.updated_at || product.created_at
  const daysSinceUpdate = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceUpdate <= 30) {
    breakdown.recency = { score: 15, max: 15, passed: true, detail: `${daysSinceUpdate} gün əvvəl yenilənib ✓` }
  } else if (daysSinceUpdate <= 60) {
    breakdown.recency = { score: 8, max: 15, passed: false, detail: `${daysSinceUpdate} gün əvvəl — yeniləmə tövsiyə olunur` }
  } else {
    breakdown.recency = { score: 0, max: 15, passed: false, detail: `${daysSinceUpdate} gün əvvəl — köhnəlib` }
  }

  // Ümumi hesablama
  const totalScore = Object.values(breakdown).reduce((sum, item) => sum + item.score, 0)
  const percentage = Math.round(totalScore)

  let level: 'low' | 'medium' | 'good' | 'excellent' = 'low'
  if (percentage >= 80) level = 'excellent'
  else if (percentage >= 60) level = 'good'
  else if (percentage >= 35) level = 'medium'

  return { totalScore, maxScore: 100, percentage, level, breakdown }
}

// Şirkətin ortalama GEO Score-u
export function calculateCompanyGeoScore(products: ProductForScoring[]): number {
  if (products.length === 0) return 0
  const total = products.reduce((sum, p) => sum + calculateGeoScore(p).percentage, 0)
  return Math.round(total / products.length)
}

// Level-ə görə rəng
export function getGeoScoreColor(level: string): string {
  switch (level) {
    case 'excellent': return '#10B981' // yaşıl
    case 'good': return '#3B82F6'      // mavi
    case 'medium': return '#F59E0B'    // sarı
    default: return '#EF4444'          // qırmızı
  }
}

// Level-ə görə label
export function getGeoScoreLabel(level: string): string {
  switch (level) {
    case 'excellent': return 'Əla'
    case 'good': return 'Yaxşı'
    case 'medium': return 'Orta'
    default: return 'Zəif'
  }
}
