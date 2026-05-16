/**
 * Session légère pour les membres (auth par profil + mot de passe).
 * Stocke uniquement l'ID + le mot de passe (déjà connu côté client) en localStorage
 * pour permettre les actions ultérieures (édition / suppression / changement mdp).
 */

const KEY = "renamci_session_v1";

export type MemberSession = {
  profileId: string;
  email: string;
  nom: string;
  prenoms: string;
  password: string; // requis pour les edge functions manage-profile
};

export function getSession(): MemberSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MemberSession;
  } catch {
    return null;
  }
}

export function setSession(s: MemberSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("renamci-session-change"));
}

export function clearSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("renamci-session-change"));
}

export function useSessionListener(cb: () => void) {
  // helper non-React – appelez depuis un useEffect
  window.addEventListener("renamci-session-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("renamci-session-change", cb);
    window.removeEventListener("storage", cb);
  };
}
