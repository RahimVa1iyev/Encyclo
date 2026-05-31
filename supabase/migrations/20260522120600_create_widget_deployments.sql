CREATE TABLE public.widget_deployments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  domain     TEXT NOT NULL,
  status     TEXT CHECK (status IN ('pending','active','blocked')) DEFAULT 'pending',
  added_by   UUID REFERENCES auth.users(id),
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, domain)
);

ALTER TABLE public.widget_deployments ENABLE ROW LEVEL SECURITY;

-- superadmin: full access (select, insert, update, delete)
CREATE POLICY "Superadmins have full access to widget_deployments"
ON public.widget_deployments
FOR ALL
USING (public.is_superadmin());

-- company owner: select only WHERE company_id = their company
CREATE POLICY "Company owners can view their widget_deployments"
ON public.widget_deployments
FOR SELECT
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);
