export interface Category {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export type UserRole = 'superadmin' | 'company';

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

export interface CompanyTranslation {
  id: string;
  company_id: string;
  locale: string;
  name: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface Company {
  id: string;
  slug: string;
  logo_url?: string;
  website?: string;
  category_id?: string;
  status: 'draft' | 'active' | 'suspended';
  owner_id: string;
  onboarding_completed: boolean;
  created_at: string;
  translations?: CompanyTranslation[];
  category?: Category;
}

export interface ProductFeatures {
  keywords?: string[];
  price?: number;
  currency?: string;
  price_type?: string;
  category_id?: string;
}

export interface ProductTranslation {
  id: string;
  product_id: string;
  locale: string;
  name: string;
  description?: string;
  features?: ProductFeatures;
  meta_title?: string;
  meta_description?: string;
}

export interface Product {
  id: string;
  company_id: string;
  slug: string;
  images: string[];
  type: 'product' | 'service';
  status: 'draft' | 'active';
  views?: number;
  created_at: string;
  translations?: ProductTranslation[];
  company?: Company;
}

export interface ForumPost {
  id: string;
  product_id: string;
  user_id: string | null;
  content: string;
  is_faq?: boolean;
  question?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan: 'starter' | 'growth' | 'scale';
  locales: string[];
  status: 'active' | 'canceled' | 'past_due';
  expires_at?: string;
  created_at: string;
}

export type Locale = 'az' | 'en' | 'ru'

export type PlanType = 'starter' | 'growth' | 'scale'

export interface WidgetResponse {
  company: Pick<Company, 'id' | 'slug' | 'logo_url'> & { name: string }
  products: Array<Pick<Product, 'id' | 'slug' | 'images' | 'views'> & { name: string; description?: string }>
}

export interface SearchResponse {
  companies: Company[]
  products: Product[]
}

export type WidgetDeployment = {
  id: string
  company_id: string
  domain: string
  status: 'pending' | 'active' | 'blocked'
  added_by: string | null
  notes: string | null
  created_at: string
}
