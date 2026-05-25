# Refonte RENAMCI — Adhésion, Messagerie & Design Premium

Tout l'existant est conservé : profils, rôles, authentification, récupération mot de passe, annuaire, corps de métier, etc.

## 1. Workflow d'adhésion avec approbation admin

**Principe** : impossible de créer un profil actif sans validation d'un administrateur.

- La table `profiles` a déjà une colonne `status` (`pending` / `approved` / `rejected`) et une table `admin_notifications` — on s'appuie dessus.
- **Inscription** : `RegisterPage` enregistre le profil en `status = pending` (déjà le défaut). Message de confirmation : « Votre demande a été envoyée, vous recevrez un email après validation ».
- **Connexion bloquée tant que `status ≠ approved`** : l'edge function `login-profile` refuse les comptes `pending` / `rejected` avec un message explicite.
- **Espace admin `/admin/demandes`** : liste des profils `pending` avec boutons Accepter / Refuser (cards comme votre capture). Action = update `status` + email automatique (acceptation / refus motivé).
- **Premier admin** : promotion manuelle via migration SQL (à confirmer avec votre email pour ajouter le rôle `admin`).
- **Page `/admin/membres`** : gestion complète (consulter, désactiver, promouvoir admin).

## 2. Messagerie de groupe + Annonces

**Messagerie** (tous les membres approuvés voient et postent) :
- Nouvelle table `messages` (id, profile_id, content, created_at, edited_at).
- Page `/messagerie` style discussion de groupe : liste chronologique inverse, **les non-lus en priorité visuelle** (point coloré + fond légèrement teinté), composer en bas.
- Realtime via Supabase Realtime (`postgres_changes`) → nouveaux messages apparaissent instantanément.
- Table `message_reads` (profile_id, message_id, read_at) pour tracker les non-lus par membre.
- Badge de notification dans la sidebar (chiffre rouge sur "Messagerie").
- Édition / suppression de ses propres messages.

**Annonces** (officielles, postées par admins) :
- Table `announcements` existe déjà. Page `/annonces` style "tableau d'affichage" : épinglées en haut, badges (Événement, Info, Urgent), date.
- Composer admin avec image optionnelle (upload vers bucket `photos`).

## 3. Refonte UI/UX — Direction "Prestige Institutionnel"

Choix par défaut (conserve l'ADN vert/or de RENAMCI) :
- **Palette** : Vert Émeraude profond `#064e3b` + Or `#c9a84c` + Ivoire `#faf7f0` + accents vert sauge.
- **Typographie** : `Cormorant Garamond` (titres élégants) + `Inter` (corps), conserve Playfair en fallback pour l'identité.
- **Layout app membre** : Sidebar fixe à gauche (comme vos captures actuelles qui fonctionnent bien) avec sections Menu / Admin / Compte, contenu central spacieux, en-tête de page avec gradient subtil.
- **Composants premium** :
  - Cartes avec ombres douces, bordures dorées discrètes, hover lift léger.
  - Boutons 3D conservés (mémoire projet) mais raffinés.
  - Avatars avec ring doré pour les membres du bureau.
  - Badges de rôle (Président, etc.) en doré avec icône couronne.
  - Animations subtiles (fade + slide) sur changement de page.
  - Empty states illustrés.

**Page d'accueil publique repensée** :
- Hero plein écran avec image illustrative (calligraphie / silhouette d'assemblée).
- Section "Notre Réseau" avec stats animées.
- Section "Corps de métier" en grille élégante.
- Section "Bureau exécutif" avec photos des dirigeants.
- Footer enrichi (déjà à jour).

## 4. Images d'illustration (générées)

- **Hero page d'accueil** : assemblée professionnelle élégante, ambiance dorée.
- **Empty state messagerie** : illustration conversation stylisée vert/or.
- **Empty state annonces** : illustration mégaphone / parchemin officiel.
- **Hero connexion / inscription** : motif géométrique islamique subtil vert/or.
- **Bannière admin** : illustration "validation / approbation" élégante.
- **Icône PWA / favicon** raffinés.

## 5. Détails techniques

```text
Migrations SQL
├── messages (table + RLS : approved members read all, write own)
├── message_reads (table + RLS : own reads only)
├── announcements RLS étendu (réserver écriture aux admins)
├── login-profile MAJ : refus si status != approved
└── publication realtime: messages

Nouvelles pages
├── /admin/demandes       (validation adhésions)
├── /admin/membres        (gestion membres)
├── /admin/annonces       (CRUD annonces)
├── /messagerie           (chat groupe + notifs)
└── /annonces             (lecture annonces)

Composants
├── AppLayout (sidebar + topbar refonte)
├── MessageBubble, MessageComposer, MessageList
├── AnnouncementCard, AnnouncementEditor
├── AdminRequestCard
├── RoleBadge (doré pour bureau)
└── EmptyState (illustrations)

Edge Functions
├── login-profile (MAJ : check status)
├── approve-membership (email d'acceptation)
├── reject-membership (email de refus)
└── post-message / delete-message (validation auteur)

Images générées (src/assets/)
├── hero-assembly.jpg
├── empty-messages.png
├── empty-announcements.png
├── auth-pattern.jpg
└── admin-validation.png
```

## Ordre d'exécution

1. Migrations DB (messages, reads, RLS, realtime).
2. Génération des 5 illustrations.
3. Refonte AppLayout + design tokens (couleurs, typo).
4. Workflow adhésion (blocage login pending + page admin demandes).
5. Messagerie temps réel + badge non-lus.
6. Annonces (lecture + admin CRUD).
7. Page d'accueil publique repensée.
8. Polish : animations, empty states, responsive mobile.

**À confirmer avant de démarrer** :
- Email de l'utilisateur à promouvoir **administrateur** initial.
- OK pour appliquer la direction « Prestige Institutionnel » par défaut, ou préférez-vous explorer 2-3 maquettes visuelles avant ?
