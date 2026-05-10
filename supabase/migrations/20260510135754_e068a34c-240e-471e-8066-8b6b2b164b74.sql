CREATE POLICY "Users can update own sessions"
ON public.sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());