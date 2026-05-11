CREATE TABLE IF NOT EXISTS public.foundation_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  foundation_slug text NOT NULL,
  marked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, foundation_slug)
);

CREATE INDEX IF NOT EXISTS foundation_progress_user_idx
  ON public.foundation_progress (user_id);

ALTER TABLE public.foundation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own foundation progress" ON public.foundation_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own foundation read" ON public.foundation_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark own foundation read" ON public.foundation_progress
  FOR DELETE USING (auth.uid() = user_id);