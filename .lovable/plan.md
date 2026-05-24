# Plan : Espace admin (adhésions) + page Annonces publique

Conserve tout l'existant (inscription, authentification membres, profils, rôles). Ajoute un workflow de validation des demandes et une page publique d'annonces.

## 1. Base de données (migration)

- **Nouvelle colonne `profiles.status`** (enum `profile_status`: `pending` | `approved` | `rejected`, défaut `pending`).
  - Les inscriptions existantes seront migrées en `approved` (pour ne rien casser).
  - La vue publique `profiles_public` filtrera désormais `status = 'approved'` → seuls les profils acceptés apparaissent dans l'annuaire.
- **Nouvelle table `announcements`** (titre, contenu, image_url, created_by, published, created_at).
  - RLS : SELECT public (tout le monde lit les publiées), INSERT/UPDATE/DELETE réservé aux admins.
- **Notifications admin** : table `admin_notifications` (type, payload jsonb, read_at, created_at) lue uniquement par les admins.
- **Création d'un compte admin** : insertion d'une ligne dans `user_roles` (role=`admin`) liée à un user_id Supabase Auth dédié administrateur.

## 2. Authentification administrateur

- L'admin utilise **Supabase Auth** (email + mot de passe), distinct du système membres.
- Page `/admin/connexion` (Supabase `signInWithPassword`).
- Compte admin initial créé via edge function `create-admin` (à exécuter 1 fois avec un secret + email/mot de passe fournis).
- Garde route `<AdminRoute>` qui vérifie `has_role(user.id, 'admin')`.

## 3. Workflow de demande d'adhésion

- L'inscription publique (`RegisterPage`) crée maintenant un profil `status = 'pending'`.
- Après envoi → l'utilisateur voit l'écran : **« Votre demande est en cours de traitement »**.
- Une ligne `admin_notifications` (type `new_membership`) est créée → badge "🔔 N" dans la navbar admin.
- Le membre **ne peut pas se connecter** tant que `status ≠ 'approved'` (message : "Votre demande est en cours de traitement" ou "Désolé votre demande n'a pas été traitée").

## 4. Console admin (`/admin`)

- **Dashboard** avec compteurs (pending / approved / rejected, total annonces).
- **`/admin/adhesions`** : liste des demandes `pending` avec détail du profil + 2 boutons :
  - **Accepter** → status `approved`, message in-app "Bienvenue à RENAMCI" affiché à la prochaine connexion.
  - **Refuser** → status `rejected`, message "Désolé votre demande n'a pas été traitée".
- Onglets : En attente / Acceptées / Refusées.
- **`/admin/annonces`** : CRUD complet des annonces (créer / éditer / publier / supprimer, upload image dans bucket `photos`).

## 5. Page Annonces publique

- Nouvelle route `/annonces` accessible à tous (lien dans la navbar).
- Liste des annonces publiées (titre, image, contenu, date) — design vert/blanc/or, Playfair Display, cohérent avec le site.
- Page détail `/annonces/:id`.

## 6. Notifications & messages au demandeur

- Au login membre (`login-profile` edge function) :
  - Si `status = 'pending'` → renvoie `{ pending: true }` → page affiche "Votre demande est en cours de traitement".
  - Si `status = 'rejected'` → renvoie `{ rejected: true }` → page affiche "Désolé votre demande n'a pas été traitée".
  - Si `status = 'approved'` et c'est la 1re connexion après acceptation → toast "Bienvenue à RENAMCI 🎉".

## Détails techniques

**Fichiers / éléments créés :**
- Migration SQL (enum `profile_status`, ajout colonne, tables `announcements` + `admin_notifications`, RLS, mise à jour vue `profiles_public`).
- `src/pages/AdminLoginPage.tsx`, `src/pages/admin/AdminDashboard.tsx`, `src/pages/admin/AdminAdhesions.tsx`, `src/pages/admin/AdminAnnonces.tsx`.
- `src/pages/AnnoncesPage.tsx`, `src/pages/AnnonceDetailPage.tsx`.
- `src/components/AdminRoute.tsx`, `src/components/AdminLayout.tsx`.
- `src/lib/admin-helpers.ts` (fetch demandes, accept/reject, CRUD annonces).
- Edge function `create-admin` (bootstrap compte admin, protégée par secret).
- Mise à jour `login-profile` (gère pending/rejected), `register-profile` (status pending + notification admin).
- Mise à jour `Navbar.tsx` (lien Annonces + lien Admin si connecté admin).
- Mise à jour `App.tsx` (nouvelles routes).

**Aucun fichier n'est modifié avant approbation du plan.**

## Ordre d'exécution
1. Migration DB.
2. Edge function `create-admin` + bootstrap du 1er compte admin (je demanderai email + mot de passe juste après approbation).
3. Workflow inscription (status pending + notif admin).
4. Console admin (auth, dashboard, adhésions).
5. Module annonces (admin CRUD + page publique).
6. Messages au demandeur côté login.
