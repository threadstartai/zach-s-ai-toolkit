ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS onboarding_role text,
  ADD COLUMN IF NOT EXISTS onboarding_time_budget text,
  ADD COLUMN IF NOT EXISTS onboarding_existing_tools text[];

CREATE INDEX IF NOT EXISTS sessions_onboarding_role_idx 
  ON public.sessions (onboarding_role) 
  WHERE onboarding_role IS NOT NULL;