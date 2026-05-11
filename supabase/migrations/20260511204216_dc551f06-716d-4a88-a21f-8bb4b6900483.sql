CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  summary text,
  summary_updated_at timestamptz,
  pinned boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes (user_id);
CREATE INDEX IF NOT EXISTS notes_user_pinned_updated_idx
  ON public.notes (user_id, pinned DESC, updated_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_notes_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_touch_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_notes_updated_at();

INSERT INTO public.notes (user_id, title, content, summary, summary_updated_at, created_at, updated_at)
SELECT
  user_id,
  CASE
    WHEN length(trim(content)) > 0 THEN substring(trim(content) FROM 1 FOR 80)
    ELSE 'My notes'
  END AS title,
  CASE
    WHEN length(trim(content)) > 0 THEN '<p>' || regexp_replace(regexp_replace(trim(content), '&', '&amp;', 'g'), '<', '&lt;', 'g') || '</p>'
    ELSE ''
  END AS content,
  summary,
  summary_updated_at,
  created_at,
  updated_at
FROM public.user_notes
WHERE NOT EXISTS (
  SELECT 1 FROM public.notes n WHERE n.user_id = user_notes.user_id
);