
-- 1. Profile status enum + column
CREATE TYPE public.profile_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.profiles
  ADD COLUMN status public.profile_status NOT NULL DEFAULT 'approved';

-- Existing rows are already 'approved' via default. New inserts should be pending; we'll set explicitly in edge function.
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending';

-- 2. Recreate profiles_public view to only expose approved
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT
  id, user_id, nom, prenoms, sexe, grade, role_assoc,
  fonction, profession, direction, ministere, contact, email, adresse,
  specialisation_ena, promotion_ena, formation_initiale,
  domaines_expertise, valeurs, photo_url, created_at, updated_at
FROM public.profiles
WHERE status = 'approved';

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 3. Restrict UPDATE on profiles.status: only admins can change it (using a trigger)
CREATE OR REPLACE FUNCTION public.guard_profile_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can change profile status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_profile_status
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_status();

-- 4. Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published announcements"
ON public.announcements FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert announcements"
ON public.announcements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update announcements"
ON public.announcements FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete announcements"
ON public.announcements FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Admin notifications
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read notifications"
ON public.admin_notifications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update notifications"
ON public.admin_notifications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role inserts notifications"
ON public.admin_notifications FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Trigger to create notification on new pending profile
CREATE OR REPLACE FUNCTION public.notify_admin_new_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO public.admin_notifications (type, payload)
    VALUES ('new_membership', jsonb_build_object(
      'profile_id', NEW.id,
      'nom', NEW.nom,
      'prenoms', NEW.prenoms,
      'email', NEW.email
    ));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_new_membership
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_membership();
