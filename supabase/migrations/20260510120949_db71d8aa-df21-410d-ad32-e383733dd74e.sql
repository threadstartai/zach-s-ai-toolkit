ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS ai_picked_tools TEXT[],
  ADD COLUMN IF NOT EXISTS ai_picked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_pick_reasoning JSONB;