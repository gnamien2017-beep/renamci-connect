## Objectif

Corriger 4 points : (1) sélecteur pays avec drapeaux pour le téléphone, (2) appels téléphoniques corrects, (3) WhatsApp opérationnel, (4) lecture hors-ligne des profils/statistiques + inscription hors-ligne avec synchronisation automatique au retour de la connexion.

---

## 1. Sélecteur de pays avec drapeaux (téléphone)

**Pages concernées :** `RegisterPage.tsx`, `EditProfileModal.tsx`.

- Installer `react-phone-number-input` (gère drapeaux SVG, formatage E.164, recherche pays, validation).
- Remplacer le champ `Input` téléphone actuel par un composant `PhoneInput` avec :
  - Pays par défaut : Côte d'Ivoire (`CI`).
  - Stockage en format **E.164** (ex. `+2250708773321`) dans la colonne `contact`.
  - Style adapté à notre design system (mêmes bordures, hauteur, focus).

**Bénéfice :** le numéro est stocké au format international complet, ce qui résout aussi les points 2 et 3.

---

## 2. Correction de l'appel téléphonique

**Fichier :** `ProfileModal.tsx` → `InfoRow` (helper `formatPhone`).

Problème : la regex actuelle `replace(/^0/, "+225")` retire le `0` initial, ce qui peut donner un numéro tronqué pour les anciens enregistrements ou les pays autres que CI.

**Solution :**
- Si le numéro commence déjà par `+` → utiliser tel quel.
- Sinon, si commence par `00` → remplacer par `+`.
- Sinon, si 10 chiffres commençant par `0` (format local CI) → préfixer `+225` **sans retirer le 0** (CI n'a pas de trunk prefix à supprimer).
- Affichage formaté lisible, lien `tel:` au format E.164.

---

## 3. WhatsApp opérationnel

Même `InfoRow` :
- URL : `https://wa.me/<E164 sans +>` (ex. `https://wa.me/2250708773321`).
- Ouverture via `window.open(url, "_blank", "noopener")` au lieu d'un simple `<a>` (certains `Popover` interceptent le clic sur mobile).
- Tester aussi le schéma `whatsapp://send?phone=...` en fallback mobile.

---

## 4. Mode hors-ligne complet

### 4.a Lecture hors-ligne (profils + statistiques)

- Mettre en cache les réponses `profiles_public` dans **IndexedDB** (via `idb-keyval`, léger).
- Modifier `fetchProfiles`, `fetchProfilesByCorps`, `fetchStats` pour :
  1. Tenter le réseau ; si succès → mettre à jour le cache puis retourner.
  2. Si réseau indisponible → lire depuis le cache.
- Ajouter une bannière discrète "Mode hors-ligne — données du …" quand on lit depuis le cache.
- Étendre le Service Worker pour précacher les routes principales (`/`, `/grade/*`, `/corps/*`, `/register`).

### 4.b Inscription hors-ligne (file d'attente + synchro)

- Dans `RegisterPage`, détecter `navigator.onLine`.
- Si **hors-ligne** au submit :
  - Photo : convertir en `Blob` base64 et stocker dans IndexedDB.
  - Pousser la soumission dans une file `pending-registrations` (IndexedDB).
  - Toast : « Profil enregistré localement, il sera publié dès le retour de la connexion. »
  - Naviguer vers une page de confirmation locale.
- **Synchroniseur** (`src/lib/offline-sync.ts`) :
  - Au démarrage de l'app + sur l'événement `online` → vider la file en appelant `register-profile` (avec upload photo si présente).
  - Toast de succès à chaque profil synchronisé, retry exponentiel sur échec réseau.
- Optionnel : enregistrer un Background Sync (`registration.sync.register("sync-profiles")`) avec fallback JS pour les navigateurs sans support.

---

## Détails techniques

- **Dépendances ajoutées :** `react-phone-number-input`, `idb-keyval`.
- **Nouveaux fichiers :**
  - `src/lib/offline-cache.ts` — wrapper IndexedDB pour profils/stats.
  - `src/lib/offline-sync.ts` — file d'attente d'inscriptions + synchroniseur.
  - `src/components/OfflineBanner.tsx` — bannière statut hors-ligne.
- **Fichiers modifiés :**
  - `src/pages/RegisterPage.tsx`, `src/components/EditProfileModal.tsx` — PhoneInput + soumission offline.
  - `src/components/ProfileModal.tsx` — `formatPhone` robuste + WhatsApp via `window.open`.
  - `src/lib/supabase-helpers.ts` — `fetch*` avec fallback cache.
  - `public/sw.js` — précache des routes app + stratégie StaleWhileRevalidate pour `profiles_public`.
  - `src/App.tsx` (ou `main.tsx`) — initialiser le synchroniseur, monter `OfflineBanner`.

---

## Ce qui n'est PAS inclus

- Pas de modification du backend / RLS (la file de synchro réutilise `register-profile`).
- Pas d'édition/suppression hors-ligne (nécessite vérification mot de passe en ligne) — uniquement lecture + nouvelle inscription.
