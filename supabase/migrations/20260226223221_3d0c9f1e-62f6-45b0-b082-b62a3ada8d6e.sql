
-- Create a secure view that hides password_hash
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
  SELECT id, user_id, nom, prenoms, sexe, grade, fonction, profession,
         direction, ministere, contact, email, adresse, specialisation_ena,
         promotion_ena, formation_initiale, domaines_expertise, valeurs,
         photo_url, created_at, updated_at
  FROM public.profiles;

-- Allow anyone to insert profiles (public registration)
CREATE POLICY "Anyone can insert profiles"
  ON public.profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
