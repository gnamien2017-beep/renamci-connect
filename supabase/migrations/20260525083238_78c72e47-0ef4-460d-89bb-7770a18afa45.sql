
-- =====================================================
-- MESSAGES TABLE (group chat)
-- =====================================================
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_created_at ON public.messages (created_at DESC);
CREATE INDEX idx_messages_profile_id ON public.messages (profile_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper: check if a profile_id corresponds to an approved member
CREATE OR REPLACE FUNCTION public.is_approved_profile(_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id AND status = 'approved'
  )
$$;

-- Anyone (public) can read messages — the app gates this at the route level after auth.
-- Reading is open because the auth model is profile-based (no auth.uid()).
CREATE POLICY "Messages readable by all"
  ON public.messages FOR SELECT
  USING (true);

-- Inserts are validated by edge functions (service_role). Direct inserts blocked.
CREATE POLICY "Service role inserts messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role updates messages"
  ON public.messages FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role deletes messages"
  ON public.messages FOR DELETE
  USING (auth.role() = 'service_role');

-- Admins can also delete via SQL/dashboard
CREATE POLICY "Admins delete messages"
  ON public.messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- MESSAGE READS TABLE (per-member read tracking)
-- =====================================================
CREATE TABLE public.message_reads (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, message_id)
);

CREATE INDEX idx_message_reads_profile ON public.message_reads (profile_id);

ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reads visible to all"
  ON public.message_reads FOR SELECT
  USING (true);

CREATE POLICY "Service role manages reads"
  ON public.message_reads FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- REALTIME for messages
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;
