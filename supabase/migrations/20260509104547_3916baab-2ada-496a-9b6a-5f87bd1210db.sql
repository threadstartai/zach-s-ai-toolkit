
-- Helper: updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- tools
CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_number text,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('foundational','thinking-writing','research-study','building','daily-life')),
  tagline text,
  source_doc text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read tools" ON public.tools FOR SELECT USING (true);
CREATE TRIGGER tools_set_updated_at BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- chunks
CREATE TABLE public.chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  chunk_type text NOT NULL CHECK (chunk_type IN ('intro','setup','first-prompt','why-it-matters','advanced','common-mistake','workflow-example','process-overlay')),
  title text,
  content text NOT NULL,
  tags_audience text[] NOT NULL DEFAULT '{}',
  tags_use_case text[] NOT NULL DEFAULT '{}',
  tags_confidence text[] NOT NULL DEFAULT '{}',
  tags_ladder_stage integer CHECK (tags_ladder_stage BETWEEN 1 AND 5),
  priority integer NOT NULL DEFAULT 50 CHECK (priority BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read chunks" ON public.chunks FOR SELECT USING (true);
CREATE TRIGGER chunks_set_updated_at BEFORE UPDATE ON public.chunks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX chunks_tool_id_idx ON public.chunks(tool_id);

-- sessions
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  q2_audience text,
  q3_use_case text,
  q3_other_text text,
  q4_confidence text,
  q5_learning_style text,
  result_payload jsonb,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read sessions" ON public.sessions FOR SELECT USING (true);

-- email_captures
CREATE TABLE public.email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  subscribed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit email captures" ON public.email_captures FOR INSERT WITH CHECK (true);
