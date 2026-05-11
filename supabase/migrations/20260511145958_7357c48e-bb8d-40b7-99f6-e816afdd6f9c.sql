DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chunk_feedback_tool_slug_length'
  ) THEN
    ALTER TABLE public.chunk_feedback
      ADD CONSTRAINT chunk_feedback_tool_slug_length
        CHECK (length(tool_slug) <= 80);
  END IF;
END $$;