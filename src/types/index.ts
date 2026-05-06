export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  company_id: string;
  category_id: string;
  description?: string;
  price?: number;
  image_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_end: string;
  created_at: string;
}
