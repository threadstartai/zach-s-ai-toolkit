-- Step 1: rate_limits table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limits_identifier_action
  ON public.rate_limits(identifier, action, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- intentionally no policies: only service_role bypasses RLS

-- Step 2: lock down sessions + email_captures
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can read sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.sessions;
DROP POLICY IF EXISTS "Allow public insert" ON public.sessions;

CREATE POLICY "Service role insert only"
  ON public.sessions FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role read"
  ON public.sessions FOR SELECT TO service_role USING (true);

DROP POLICY IF EXISTS "Anyone can submit email captures" ON public.email_captures;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.email_captures;
DROP POLICY IF EXISTS "Allow public insert" ON public.email_captures;

CREATE POLICY "Service role insert only"
  ON public.email_captures FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role read"
  ON public.email_captures FOR SELECT TO service_role USING (true);

-- Step 3: rate limit checker
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_count integer,
  p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_window_cutoff timestamptz;
BEGIN
  v_window_cutoff := now() - (p_window_seconds || ' seconds')::interval;

  DELETE FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND window_start < v_window_cutoff;

  SELECT COUNT(*) INTO v_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND window_start >= v_window_cutoff;

  IF v_count >= p_max_count THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits (identifier, action) VALUES (p_identifier, p_action);
  RETURN true;
END;
$$;