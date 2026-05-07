export interface Category {
  id: string;
  slug: string;
  name: string;
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

export interface ProductTranslation {
  id: string;
  product_id: string;
  locale: string;
  name: string;
  description?: string;
  features?: Record<string, string>;
  meta_title?: string;
  meta_description?: string;
}

export interface Product {
  id: string;
  company_id: string;
  slug: string;
  images: string[];
  type: 'product' | 'service';
  status: 'draft' | 'active' | 'suspended';
  created_at: string;
  translations?: ProductTranslation[];
  company?: Company;
}

export interface ForumPost {
  id: string;
  product_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan: 'basic' | 'pro' | 'enterprise';
  locales: string[];
  status: 'active' | 'cancelled' | 'past_due';
  expires_at?: string;
  created_at: string;
}
