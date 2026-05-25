
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Promote the president as the initial admin
UPDATE public.profiles
SET is_admin = true
WHERE nom = 'SOUMBOUNOU' AND prenoms = 'Alioune';
