
DO $$ BEGIN
  CREATE TYPE public.announcement_approval AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS approval_status public.announcement_approval NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Existing rows are considered already approved so the public feed stays consistent
UPDATE public.announcements
SET approval_status = 'approved', approved_at = COALESCE(approved_at, created_at)
WHERE approval_status = 'pending';

-- Tighten the public read policy: published AND approved (admins keep full visibility)
DROP POLICY IF EXISTS "Anyone can view published announcements" ON public.announcements;
CREATE POLICY "Public sees published approved announcements"
ON public.announcements FOR SELECT
USING (
  (published = true AND approval_status = 'approved')
  OR public.has_role(auth.uid(), 'admin'::app_role)
);
