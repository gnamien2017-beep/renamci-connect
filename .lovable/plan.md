# Plan — Évolutions profil & authentification

## Décisions prises (suite au skip des questions)

- **Rôle** : nouveau champ ajouté en haut du formulaire. **Grade conservé** mais déplacé plus bas (les deux notions sont distinctes — fonction associative vs grade administratif).
- **Authentification** : on **garde le système actuel** (mot de passe par profil, identification via nom/prénoms), on ajoute **une page de connexion** dédiée par **email + mot de passe** (l'email du profil sert d'identifiant).
- **Récupération** : envoi d'un **lien sécurisé** par email (token unique, expirant en 1h). Le mot de passe haché n'est jamais renvoyé.
- **« Autre section »** : interprété comme une nouvelle section visuelle « Rôle dans l'association » dans le formulaire d'inscription/édition, séparée de la section professionnelle.

## 1. Base de données (migration)

- Création de l'enum `app_role_assoc` avec : `president`, `vice_president`, `secretaire_general`, `tresorier_principal`, `secretaire_national`, `membre_fondateur`, `membre_actif`.
- Ajout colonne `role_assoc app_role_assoc` (nullable) sur `profiles`.
- Création table `password_reset_tokens` (profile_id, token_hash, expires_at, used_at).
- Activation RLS sur la nouvelle table (accès uniquement via service_role / edge function).
- **Conservation** de la colonne `adresse` en base (suppression UI seulement, pour ne pas perdre les données existantes).
- **Conservation** de `profession` en base (renommage UI seulement → « Emploi »).

## 2. Formulaires (inscription + édition)

- Nouvelle section **« Rôle dans l'association »** en haut, juste après l'identité, avec un `Select` listant les 7 rôles.
- Champ **« Grade »** repositionné dans la section professionnelle (sous Fonction).
- Champ **« Adresse »** retiré du formulaire (toujours en base).
- Label **« Profession »** remplacé par **« Emploi »** (clé technique `profession` inchangée).
- Nouveau champ **« Nouveau mot de passe »** (optionnel) dans `EditProfileModal` pour permettre la modification — passé via `updates.new_password` (déjà géré côté edge function `manage-profile`).

## 3. Page de connexion `/connexion`

- Formulaire : email + mot de passe.
- Edge function `login-profile` : retrouve le profil par email, vérifie le hash, renvoie l'ID + un jeton de session léger stocké en `localStorage`.
- Lien « Mot de passe oublié ? » → `/mot-de-passe-oublie`.
- Lien « Pas encore inscrit ? » → `/inscription`.
- Bouton « Se déconnecter » dans la navbar quand connecté.

## 4. Récupération du mot de passe

- Page `/mot-de-passe-oublie` : saisie email → appel edge function `request-password-reset`.
- Edge function génère un token, le stocke haché, envoie un email avec lien `/reinitialiser-mot-de-passe?token=...`.
- Page `/reinitialiser-mot-de-passe` : saisie nouveau mot de passe → edge function `reset-password` valide le token et met à jour le hash.
- **Infrastructure email Lovable Cloud** (transactionnel) à configurer — nécessitera la mise en place d'un domaine d'envoi.

## 5. Affichage des profils

- Carte profil et `ProfileModal` : afficher le **Rôle** (badge doré au-dessus du grade quand présent).
- Label « Profession » → « Emploi » partout en lecture.
- Adresse retirée de l'affichage.

---

## Détails techniques

**Tables modifiées** : `profiles` (ajout `role_assoc`), nouvelle `password_reset_tokens`.

**Edge functions créées** : `login-profile`, `request-password-reset`, `reset-password`.

**Edge function modifiée** : `manage-profile` (déjà gère `new_password` → rien à faire).

**Fichiers front impactés** :
- `src/lib/supabase-helpers.ts` (constantes `ROLES_ASSOC`)
- `src/pages/RegisterPage.tsx` (réorganisation form)
- `src/components/EditProfileModal.tsx` (idem + nouveau mdp)
- `src/components/ProfileCard.tsx` + `ProfileModal.tsx` (affichage rôle, masquage adresse, label Emploi)
- Nouveau : `src/pages/LoginPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`
- `src/App.tsx` (routes)
- `src/components/Navbar.tsx` (lien Connexion / Déconnexion)

**Prérequis email** : la fonctionnalité email nécessite la configuration d'un domaine d'envoi via la boîte de dialogue Lovable Cloud. Sera demandée au moment de l'implémentation des emails.

---

## Ordre d'exécution

1. Migration BD (enum + colonne + table tokens)
2. Réorganisation formulaires + ajout Rôle + retrait Adresse + renommage Emploi
3. Affichage profils mis à jour
4. Page de connexion + edge function `login-profile`
5. Configuration email + récupération/reset mot de passe
6. Modification mot de passe dans l'édition profil
