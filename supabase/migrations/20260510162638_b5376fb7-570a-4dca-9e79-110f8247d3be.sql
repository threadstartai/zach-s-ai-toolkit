ALTER TABLE public.chunk_feedback
  ADD COLUMN IF NOT EXISTS chunk_id uuid;

CREATE INDEX IF NOT EXISTS chunk_feedback_chunk_id_idx
  ON public.chunk_feedback (chunk_id)
  WHERE chunk_id IS NOT NULL;