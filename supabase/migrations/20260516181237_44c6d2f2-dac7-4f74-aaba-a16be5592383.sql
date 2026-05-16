DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT
  id, user_id, nom, prenoms, sexe, grade, fonction, profession,
  direction, ministere, contact, email, adresse, specialisation_ena,
  promotion_ena, formation_initiale, domaines_expertise, valeurs,
  photo_url, role_assoc, created_at, updated_at
FROM public.profiles;