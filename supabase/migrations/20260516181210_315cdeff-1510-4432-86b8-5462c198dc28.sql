-- Enum des rôles dans l'association
CREATE TYPE public.app_role_assoc AS ENUM (
  'president',
  'vice_president',
  'secretaire_general',
  'tresorier_principal',
  'secretaire_national',
  'membre_fondateur',
  'membre_actif'
);

-- Ajout du champ role_assoc sur profiles
ALTER TABLE public.profiles
  ADD COLUMN role_assoc public.app_role_assoc;

-- Table des tokens de réinitialisation
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_profile_id ON public.password_reset_tokens(profile_id);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Aucune politique publique : seul service_role (edge functions) accède
CREATE POLICY "Service role full access on reset tokens"
  ON public.password_reset_tokens
  FOR ALL
  USING (auth.role() = 'service_role');