# Encyclo — Layihə Texniki Sənədi (CLAUDE.md)

> Bu fayl Claude AI-a layihəni başdan-ayağa izah etmək üçün yazılmışdır.
> Bütün komponent, route, API və verilənlər bazası strukturu ətraflı açıqlanmışdır.

---

## 1. Layihə Haqqında Ümumi Məlumat

**Encyclo** — Azərbaycanın ilk **GEO (Generative Engine Optimization)** platformasıdır.
Məqsəd: Azərbaycan şirkətlərinin məhsul və xidmətlərini ChatGPT, Perplexity, Google AI kimi
AI axtarış sistemlərində görünən etmək.

### Əsas İdeya

Şirkətlər öz məhsullarını Encyclo-ya strukturlaşdırılmış ensiklopediya formatında daxil edir.
Encyclo bu məlumatı AI axtarış sistemlərinin anlaya biləcəyi şəkildə optimallaşdırır.
Nəticədə, istifadəçilər ChatGPT-ə sual verəndə, Encyclo-dakı məhsullar tövsiyə edilir.

Bunun yanında Encyclo bir **widget sistemi** təqdim edir — partner saytlar `widget.js`
skriptini öz saytına yerləşdirir, widget isə həmin saytın kontentinə uyğun Azərbaycan
məhsullarını göstərir.

---

## 2. Texnoloji Stack

| Texnologiya | Version | Rolu |
|---|---|---|
| Next.js | ^15.5.18 | Full-stack framework (App Router) |
| React | ^19.2.6 | UI library |
| TypeScript | ^5 | Tip sistemi |
| Supabase | ^2.105.4 | Database (PostgreSQL) + Auth + Storage |
| @supabase/ssr | ^0.10.3 | Server-side Supabase client (cookies) |
| TailwindCSS | ^3.4.1 | CSS utility framework |
| next-themes | ^0.4.6 | Tema sistemi |
| shadcn/ui | ^4.7.0 | UI komponent kitabxanası |
| lucide-react | ^1.14.0 | İkon kitabxanası |
| date-fns | ^4.1.0 | Tarix formatlaşdırması |
| sonner | ^2.0.7 | Toast bildirişləri |
| DM Sans (Google Fonts) | — | Əsas şrift |
| Groq API (Llama 4) | — | AI kateqoriya klassifikasiyası (widget üçün) |

---

## 3. Ətraf Mühit Dəyişənləri (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=...          # Supabase proje URL-i
NEXT_PUBLIC_SUPABASE_ANON_KEY=...     # Supabase anonim açarı
NEXT_PUBLIC_SITE_URL=...              # Saytın public URL-i (SEO üçün)
GROQ_API_KEY=...                      # Groq (Llama 4) API açarı
```

---

## 4. Qovluq Strukturu

```
Encyclo/
├── public/
│   ├── widget.js              # Embed-edilə bilən widget skripti (3rd-party saytlar üçün)
│   ├── test-news.html         # Widget-i test etmək üçün xəbər saytı mockup-u
│   └── og-default.png         # Social media paylaşımı üçün default şəkil
│
├── supabase/
│   └── migrations/
│       ├── 20260522120000_create_profiles_table.sql
│       └── 20260522120600_create_widget_deployments.sql
│
├── src/
│   ├── middleware.ts           # Auth routing middleware
│   ├── types/
│   │   └── index.ts           # Bütün TypeScript interfeyslər
│   ├── lib/
│   │   ├── utils.ts           # cn(), inputClass, selectClass
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser-side Supabase client
│   │   │   └── server.ts      # Server-side Supabase client
│   │   └── constants/
│   │       └── plans.ts       # Subscription plan limitləri
│   ├── components/
│   │   ├── Navbar.tsx          # Public navbar (tema + auth)
│   │   ├── Footer.tsx          # Public footer
│   │   ├── ThemeSwitcher.tsx   # 4 tema switcher (slate/indigo/ocean/forest)
│   │   ├── ProductTabBar.tsx   # Məhsul tab navigation
│   │   ├── cards.tsx           # Ümumi kart komponentləri
│   │   ├── ui-kit.tsx          # SectionHeading, Card, Badge komponentləri
│   │   ├── encyclopedia/
│   │   │   └── SearchBar.tsx   # Ensiklopediya axtarış çubuğu
│   │   ├── product/
│   │   │   └── ContactForm.tsx # Məhsul əlaqə formu
│   │   ├── forum/
│   │   │   └── RedditForum.tsx # Forum/FAQ Reddit-stilindəki komponent
│   │   └── ui/                 # shadcn/ui komponentləri
│   │       ├── alert-dialog.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sonner.tsx
│   │       ├── table.tsx
│   │       └── textarea.tsx
│   └── app/
│       ├── layout.tsx           # Root layout (DM Sans font, tema init script, metadata)
│       ├── globals.css          # Global CSS (4 color tema, utility classes)
│       ├── robots.ts            # SEO robots.txt
│       ├── sitemap.ts           # Dinamik sitemap
│       ├── (public)/            # Navbar+Footer olan public səhifələr
│       │   ├── layout.tsx
│       │   ├── page.tsx         # Ana səhifə (landing)
│       │   ├── encyclopedia/    # Ensiklopediya browse səhifəsi
│       │   ├── categories/      # Kateqoriyalar
│       │   ├── companies/       # Şirkət siyahısı
│       │   ├── products/        # Məhsul siyahısı
│       │   ├── features/        # Platforma xüsusiyyətləri
│       │   ├── pricing/         # Tariflər/planlar
│       │   ├── about/           # Haqqımızda
│       │   ├── login/           # Giriş
│       │   ├── register/        # Qeydiyyat
│       │   └── forgot-password/ # Şifrə yeniləmə
│       ├── (onboarding)/        # İlk dəfə qeydiyyatdan keçən şirkətlər üçün
│       │   ├── layout.tsx
│       │   └── onboarding/
│       │       └── page.tsx     # 3 addımlı onboarding wizard
│       ├── (dashboard)/         # Şirkət idarəetmə paneli
│       │   ├── layout.tsx       # Sidebar + topbar (client component)
│       │   └── dashboard/
│       │       ├── page.tsx         # Dashboard ana səhifəsi (statistika)
│       │       ├── products/        # Məhsullar siyahısı + [id] detail
│       │       ├── add-content/     # Yeni məhsul əlavə et
│       │       ├── company/         # Şirkət profili redaktəsi
│       │       ├── forum/           # Forum & FAQ idarəetməsi
│       │       ├── leads/           # Müraciətlər (contact form submissions)
│       │       ├── reports/         # Hesabatlar
│       │       ├── distribution/    # Yayım (widget deployment)
│       │       ├── ai-content/      # AI məzmun (soon)
│       │       ├── encyclopedia/    # Ensiklopediya görünüşü
│       │       └── billing/         # Billing (soon)
│       ├── (admin)/             # Superadmin idarəetmə paneli
│       │   ├── layout.tsx       # Admin sidebar + topbar (client component)
│       │   └── admin/
│       │       ├── page.tsx         # Admin overview (şirkət/partner/keyword sayları)
│       │       ├── companies/       # Bütün şirkətləri idarə et
│       │       ├── partners/        # Partner saytları idarə et
│       │       ├── keywords/        # Keyword/kateqoriya idarəetməsi
│       │       └── widgets/         # Widget deployment-ları idarə et
│       ├── widget/              # Embed widget viewer səhifəsi
│       │   ├── layout.tsx
│       │   └── [slug]/          # Şirkətin widget preview-u
│       └── api/                 # API Route-ları
│           ├── widget/
│           │   ├── route.ts         # GET /api/widget — ümumi widget API
│           │   └── smart/
│           │       └── route.ts     # GET /api/widget/smart — AI-powered smart widget
│           ├── search/
│           │   └── route.ts         # GET /api/search — axtarış API
│           ├── ai-onboarding/
│           │   └── route.ts         # POST /api/ai-onboarding — AI şirkət təsviri
│           ├── ai-content/
│           │   └── route.ts         # AI məzmun generasiyası
│           ├── ai-company-profile/
│           │   └── route.ts         # AI şirkət profili
│           ├── ai-faq/
│           │   └── route.ts         # AI FAQ generasiyası
│           └── ai-optimize/
│               └── route.ts         # AI GEO optimizasiya
```

---

## 5. Auth & Route Sistemi (`middleware.ts`)

### Routing Məntiqi

```
İstifadəçi giriş etməmişsə:
  /dashboard, /onboarding, /admin → /login yönləndirilir

İstifadəçi giriş etmişsə:
  role = superadmin:
    /dashboard, /onboarding, /login, /register → /admin yönləndirilir
    /admin — buraxılır

  role = company:
    /admin → /dashboard yönləndirilir
    /dashboard (onboarding tamamlanmamışsa) → /onboarding yönləndirilir
    /login, /register → /dashboard yönləndirilir
```

### Role Sistemi

| Role | Panel | Giriş |
|---|---|---|
| `superadmin` | `/admin` | Yalnız admin paneli |
| `company` | `/dashboard` | Yalnız şirkət paneli |

Hər authentication-da `profiles` cədvəlindən `role` oxunur və
`x-user-role` HTTP header-ə yazılır (downstream Server Components üçün).

---

## 6. Verilənlər Bazası Strukturu (Supabase PostgreSQL)

### Əsas Cədvəllər

#### `profiles`
```sql
id         UUID (auth.users-ə ref)
role       TEXT ('superadmin' | 'company')
created_at TIMESTAMPTZ
```
- Hər yeni `auth.users` sətri üçün trigger ilə avtomatik yaradılır (default: `company`)
- RLS aktiv: istifadəçi yalnız öz profilini görə bilər; superadmin hamısını

#### `companies`
```sql
id                   UUID
slug                 TEXT (unique)
logo_url             TEXT
website              TEXT
category_id          UUID → categories
status               TEXT ('draft' | 'active' | 'suspended')
owner_id             UUID → auth.users
onboarding_completed BOOLEAN
created_at           TIMESTAMPTZ
```

#### `company_translations`
```sql
id             UUID
company_id     UUID → companies
locale         TEXT ('az' | 'en' | 'ru')
name           TEXT
description    TEXT
meta_title     TEXT
meta_description TEXT
```

#### `products`
```sql
id         UUID
company_id UUID → companies
slug       TEXT
images     TEXT[]
type       TEXT ('product' | 'service')
status     TEXT ('draft' | 'active')
views      INTEGER
created_at TIMESTAMPTZ
```

#### `product_translations`
```sql
id          UUID
product_id  UUID → products
locale      TEXT
name        TEXT
description TEXT
features    JSONB  -- { keywords, price, currency, price_type, category_id }
meta_title  TEXT
meta_description TEXT
```

#### `categories`
```sql
id         UUID
slug       TEXT
name       TEXT
created_at TIMESTAMPTZ
```

#### `subscriptions`
```sql
id         UUID
company_id UUID → companies
plan       TEXT ('starter' | 'growth' | 'scale')
locales    TEXT[]
status     TEXT ('active' | 'canceled' | 'past_due')
expires_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

#### `widget_deployments`
```sql
id         UUID
company_id UUID → companies
domain     TEXT
status     TEXT ('pending' | 'active' | 'blocked')
added_by   UUID → auth.users
notes      TEXT
created_at TIMESTAMPTZ
UNIQUE(company_id, domain)
```

#### `partner_sites` (Smart Widget üçün)
```sql
id          UUID
name        TEXT
domain      TEXT
api_key     TEXT (unique)
category_id UUID → categories
status      TEXT ('active' | ...)
```

#### `partner_site_companies`
```sql
partner_site_id UUID → partner_sites
company_id      UUID → companies
priority        INTEGER
```

#### `category_keywords`
```sql
category_id UUID → categories
keyword     TEXT
weight      FLOAT
```

---

## 7. Subscription Plan Limitləri (`src/lib/constants/plans.ts`)

```typescript
PLAN_LIMITS = {
  starter: { domains: 1,  products: 5  },
  growth:  { domains: 5,  products: 15 },
  scale:   { domains: -1, products: 30 }, // -1 = limitsiz
}
```

---

## 8. API Route-ları (Ətraflı)

### `GET /api/widget`

**Ümumi widget API** — domain whitelist yoxlaması ilə şirkətin məhsullarını qaytarır.

**Query Params:**
- `type` — `'products'` | `'companies'` (default: companies)
- `category` — kateqoriya slug-u ilə filter
- `limit` — max say (plan limitinə tabedir)
- `company_id` — xüsusi şirkətin məhsulları

**Məntiq:**
1. `Referer` header-dən domain çıxarır
2. `widget_deployments`-də domain + status=active yoxlayır → 403 əgər yoxdursa
3. Şirkətin subscription plan-ına baxır → `PLAN_LIMITS`-ə görə limit qoyur
4. `scale` plan-da limit yoxdur
5. Məhsulları `az` locale translation ilə qaytarır

---

### `GET /api/widget/smart`

**AI-powered smart widget** — kontekstə görə uyğun məhsulları göstərir.

**Query Params:**
- `key` — Partner saytın API açarı (tələb olunur)
- `url` — Cari səhifənin URL-i
- `title` — Cari səhifənin başlığı

**Məntiq (3 mərhələli kateqoriya matching):**

```
1. KEYWORD matching:
   URL + title-dan sözlər çıxarılır (min 3 hərfli)
   → category_keywords cədvəlindən uyğun kateqoriya tapılır
   → Hər keyword-in weight-i toplanır, ən yüksək score-lu kateqoriya seçilir

2. AI matching (Groq - Llama 4 Scout):
   Keyword match tapılmadıqda devreye girir
   → Bütün kateqoriya adları Groq-a göndərilir
   → Model ən uyğun kateqoriyanı qaytarır

3. DEFAULT fallback:
   AI də tapammadıqda partner saytın default category_id-si istifadə olunur
```

**Cavab formatı:**
```json
{
  "site": { "name": "...", "domain": "..." },
  "matched_category": "Texnologiya",
  "match_method": "keyword" | "ai" | "default" | "none",
  "products": [
    {
      "slug": "...",
      "name": "...",
      "description": "...",
      "image": "https://...",
      "company_name": "...",
      "company_slug": "...",
      "url": "https://encyclo-phi.vercel.app/encyclopedia/products/..."
    }
  ]
}
```

---

### `POST /api/ai-onboarding`

Onboarding zamanı şirkət adı + kateqoriyaya əsasən AI ilə Azərbaycanca şirkət təsviri generasiya edir.

---

### `GET /api/search`

Ensiklopediya axtarış funksionallığı — şirkət və məhsulları ad ilə axtarır.

---

### `POST /api/ai-content`, `ai-company-profile`, `ai-faq`, `ai-optimize`

Dashboard-da AI köməkçi funksiyalar:
- **ai-content**: Məhsul təsviri generasiyası
- **ai-company-profile**: Şirkət profili AI tamamlama
- **ai-faq**: FAQ sualları generasiyası
- **ai-optimize**: GEO optimizasiya tövsiyələri

---

## 9. Widget Sistemi (`public/widget.js`)

Partner saytlar bu skripti öz HTML-inə yerləşdirir:

```html
<div id="encyclo-widget"></div>
<script src="https://encyclo.az/widget.js" data-key="PARTNER_API_KEY"></script>
```

### Widget-in İşləmə Prinsipi

```
1. Skript yüklənəndə data-key atributunu oxuyur
2. /api/widget/smart?key=...&url=...&title=... sorğusu göndərir
3. API cavab verir:
   - Məhsul yoxdursa → widget gizlədilir (display: none)
   - Məhsullar varsa → horizontal scroll card-lar render edilir
4. Kartlar:
   - Şəkil (fallback: gradient)
   - Məhsul adı
   - Şirkət adı
   - Kliklənəndə → encyclo.az/encyclopedia/products/{slug} açılır
5. "Powered by Encyclo" footer
```

**Xüsusiyyətlər:**
- IIFE (Immediately Invoked Function Expression) — qlobal namespace çirklənmir
- Silent fail — heç bir xəta istifadəçiyə göstərilmir
- Self-injecting CSS — heç bir xarici CSS tələb etmir
- Responsive: mobile-da kartlar kiçilir (220px → 180px)

---

## 10. Tema Sistemi (`src/app/globals.css`)

CSS custom properties ilə 4 rəng teması:

| Tema | Accent | Nav BG | Hero BG |
|---|---|---|---|
| `slate` (default) | `#10B981` (yaşıl) | `#0F172A` | `#0F172A` |
| `indigo` | `#4F46E5` (indigo) | `#4F46E5` | `#4F46E5` |
| `ocean` | `#1D4ED8` (mavi) | `#1E3A8A` | `#1E3A8A` |
| `forest` | `#16A34A` (yaşıl) | `#14532D` | `#14532D` |

**Tema seçimi localStorage-da saxlanılır** (`encyclo-theme` key).
Root layout-dakı inline script tema flicker-ini qarşısını alır (FOUC prevention).

**Utility class-lar:**
- `.card-hover` — hover-da yuxarı qalxma + kölgə + border accent
- `.btn-press` — active-də `scale(0.97)` effekti
- `.bg-surface`, `.text-muted-foreground`, `.border-border`, `.text-accent` və s.

---

## 11. Komponentlər (Ətraflı)

### `Navbar.tsx` (Public)
- Scroll-da glassmorphism effekti (blur + şəffaflıq)
- Mobil hamburger menü
- Auth vəziyyətinə görə: "Daxil ol / Qeydiyyat" ↔ "Dashboard"
- `ThemeSwitcher` inteqrasiyası
- `initialIsLoggedIn` prop Server Component-dən ötürülür

### `ThemeSwitcher.tsx`
- 4 rəng dairəsi göstərir
- Seçildikdə `data-theme` atributunu `<html>` elementinə yazır
- localStorage-a saxlayır

### `DashboardLayout` (Client Component)
**Sidebar qrupları:**
```
Əsas:
  - Dashboard (/)
  - Məhsullar
  - Məhsul əlavə et

İdarəetmə:
  - Şirkət profili
  - Forum & FAQ
  - Müraciətlər (badge: 3)
  - Hesabatlar

Alətlər:
  - Yayım (widget deployment)
  - AI Məzmun (disabled - tezliklə)
  - Billing (disabled - tezliklə)
```
- Şirkət adı Supabase-dən fetch edilir (az locale translation)
- Responsive: desktop = fixed sidebar, mobile = overlay drawer
- Active link accent rəng ilə highlight-lanır

### `AdminLayout` (Client Component)
**Sidebar qrupları:**
```
Əsas:
  - İdarə paneli

İdarəetmə:
  - Partner Saytlar
  - Keyword İdarəsi
  - Şirkətlər
```
- Giriş zamanı superadmin rolunu yoxlayır, əks halda `/login`-ə yönləndirir

### `OnboardingPage` — 3 addımlı wizard
```
Addım 1: Şirkət məlumatları
  - Şirkət adı
  - Kateqoriya (select)
  - Vebsayt (optional)
  - Təsvir (textarea, 500 xarakter)
  - AI ilə yaz düyməsi → /api/ai-onboarding

Addım 2: Logo yükləmə
  - Drag & drop + klik
  - PNG/JPG/WEBP, max 2MB
  - Supabase Storage-da `logos/` bucket-ə upload
  - "Sonraya saxla" ilə keçmək mümkündür

Addım 3: Hazırdır!
  - Xülasə görünüşü (şirkət adı + logo)
  - "Dashboarda keç" → onboarding_completed=true + status=active set edilir
  - auth.user_metadata da onboarding_completed=true yazılır
```

### `DashboardPage` — Ana dashboard
**Statistika kartları:**
- Ümumi məhsullar
- Aktiv məhsullar
- Qaralamalar
- Baxışlar (30 gün)

**GEO Görünmə Skoru:**
- `(aktiv məhsullar / ümumi məhsullar) × 100`
- Progress bar ilə göstərilir

**Son məhsullar cədvəli** (5 ədəd):
- Şəkil/initials, ad, ID (qısaldılmış), tarix (az locale), baxışlar, status badge

---

## 12. TypeScript Tipləri (`src/types/index.ts`)

```typescript
// Rollar
type UserRole = 'superadmin' | 'company'
type Locale = 'az' | 'en' | 'ru'
type PlanType = 'starter' | 'growth' | 'scale'

// Əsas modellər
interface Profile { id, role, created_at }
interface Company { id, slug, logo_url, website, category_id, status, owner_id, onboarding_completed, created_at, translations?, category? }
interface CompanyTranslation { id, company_id, locale, name, description?, meta_title?, meta_description? }
interface Product { id, company_id, slug, images, type, status, views?, created_at, translations?, company? }
interface ProductTranslation { id, product_id, locale, name, description?, features?, meta_title?, meta_description? }
interface ProductFeatures { keywords?, price?, currency?, price_type?, category_id? }
interface Category { id, slug, name, created_at }
interface ForumPost { id, product_id, user_id, content, is_faq?, question?, created_at }
interface Subscription { id, company_id, plan, locales, status, expires_at?, created_at }
interface WidgetResponse { company: {...}, products: [...] }
interface SearchResponse { companies: Company[], products: Product[] }
type WidgetDeployment { id, company_id, domain, status, added_by, notes, created_at }
```

---

## 13. Supabase Client-ları (`src/lib/supabase/`)

### `server.ts`
```typescript
// Server Components, Route Handlers, Middleware üçün
createServerSupabaseClient()  // cookies() istifadə edir — session-aware

// Public (auth tələb etmir) server-side sorğular üçün
createPublicSupabaseClient()  // createBrowserClient — cookies yoxdur
```

### `client.ts`
```typescript
// Client Components üçün
createClient()  // @supabase/ssr-dən createBrowserClient
```

---

## 14. Çoxdillilik (i18n)

Layihə Next.js-in built-in i18n-dən istifadə **etmir**.
Bunun əvəzinə hər model üçün ayrı translation cədvəli var:
- `company_translations` (locale: az/en/ru)
- `product_translations` (locale: az/en/ru)

Sorğularda tipik olaraq `locale = 'az'` filter qoyulur.
Çoxdilli dəstək dashboard-da `Add Content` funksionallığının hissəsidir.

---

## 15. SEO & Meta

Root layout-da:
```typescript
metadata = {
  title: { default: "Encyclo — Azərbaycanın Biznes Ensiklopediyası", template: "%s — Encyclo" },
  description: "Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.",
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: "Encyclo", image: "/og-default.png" (1200×630) },
  twitter: { card: "summary_large_image" }
}
```

- `src/app/robots.ts` — `/admin`, `/dashboard`, `/onboarding` noindex
- `src/app/sitemap.ts` — Dinamik sitemap: şirkət + məhsul URL-ləri

---

## 16. Deploy & Production

- **Platform:** Vercel (production URL: `https://encyclo-phi.vercel.app`)
- **Verilənlər bazası:** Supabase (managed PostgreSQL)
- **Storage:** Supabase Storage (`logos/` bucket)
- **AI:** Groq API (Llama 4 Scout — sürətli, ucuz, multilingual)

---

## 17. Kritik İş Axınları

### Yeni Şirkət Qeydiyyatı
```
/register → auth.signUp() 
→ Supabase trigger: profiles(role=company) yaranır
→ companies cədvəlinə şirkət yazılır (status=draft, onboarding_completed=false)
→ middleware → /onboarding yönləndirir
→ 3 addım wizard tamamlanır
→ status=active, onboarding_completed=true
→ user_metadata.onboarding_completed=true
→ /dashboard-a yönləndirir
```

### Widget-in Yerləşdirilməsi (partner sayt)
```
Admin panel-də:
  - Partner sayt əlavə edilir (partner_sites cədvəli)
  - Sayta şirkət(lər) əlavə edilir (partner_site_companies)
  - API key generasiya edilir

Partner sayt-da:
  - <div id="encyclo-widget"></div>
  - <script src="...widget.js" data-key="API_KEY"></script>
  
İstifadəçi sayta daxil olanda:
  - widget.js yüklənir
  - /api/widget/smart?key=...&url=...&title=... çağrılır
  - AI/keyword matching ilə uyğun məhsullar seçilir
  - Horizontal scroll kart sırasında göstərilir
```

### Məhsul Əlavə Etmə (Dashboard)
```
/dashboard/add-content:
  - Ad (az/en/ru)
  - Təsvir (az/en/ru)
  - Şəkillər upload (Supabase Storage)
  - Keywords (GEO üçün)
  - Qiymət / növ
  - Status: draft → active
→ products + product_translations cədvəlinə yazılır
→ /api/widget endpoint-ləri bu məhsulları qaytaracaq
```

---

## 18. Faylların Rolu Xülasəsi (Quick Reference)

| Fayl | Rolu |
|---|---|
| `src/middleware.ts` | Auth guard + role-based routing |
| `src/app/layout.tsx` | Kök layout, font, tema init, global meta |
| `src/app/globals.css` | 4 tema, utility classes |
| `src/types/index.ts` | Bütün TypeScript interfeyslər |
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `src/lib/supabase/client.ts` | Client-side Supabase client |
| `src/lib/constants/plans.ts` | Subscription plan limitləri |
| `src/lib/utils.ts` | `cn()`, input/select CSS class-ları |
| `src/components/Navbar.tsx` | Public navbar (scroll blur, mobile menu) |
| `src/components/ThemeSwitcher.tsx` | 4 tema seçici |
| `src/app/(public)/page.tsx` | Landing page (hero, features, stats, CTA) |
| `src/app/(onboarding)/onboarding/page.tsx` | 3 addımlı şirkət onboarding wizard |
| `src/app/(dashboard)/layout.tsx` | Dashboard sidebar + topbar (client) |
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard ana səhifə (statistika) |
| `src/app/(admin)/layout.tsx` | Admin sidebar + topbar (client) |
| `src/app/(admin)/admin/page.tsx` | Admin overview (server component) |
| `src/app/api/widget/route.ts` | Ümumi widget API (domain whitelist + plan limit) |
| `src/app/api/widget/smart/route.ts` | AI-powered smart widget (keyword+Groq matching) |
| `src/app/api/ai-onboarding/route.ts` | AI şirkət təsviri generasiyası |
| `public/widget.js` | 3rd-party embed widget skripti (IIFE) |
| `public/test-news.html` | Widget test səhifəsi |
| `supabase/migrations/*.sql` | DB schema: profiles + widget_deployments |

---

*Sənəd son yenilənmə: 2026-05-23*
