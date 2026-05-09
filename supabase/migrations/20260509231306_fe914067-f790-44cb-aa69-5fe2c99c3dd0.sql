ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);

DROP POLICY IF EXISTS "Users can view own sessions" ON public.sessions;
CREATE POLICY "Users can view own sessions"
ON public.sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());