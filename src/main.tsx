import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Service Worker : uniquement en production, jamais dans l'aperçu Lovable ou un iframe
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

// Allowlist stricte : le SW ne s'active QUE sur le domaine de production publié
const PRODUCTION_HOSTS = ["renamci.lovable.app"];
const hostname = window.location.hostname;
const isProductionHost = PRODUCTION_HOSTS.includes(hostname);
const isHttps = window.location.protocol === "https:";

if (isProductionHost && isHttps && !isInIframe && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Recharge la page une seule fois quand le nouveau SW prend le contrôle
      let reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });

      // Demande au SW en attente de s'activer immédiatement
      const promote = (worker: ServiceWorker | null) => {
        if (worker && worker.state === "installed" && navigator.serviceWorker.controller) {
          worker.postMessage({ type: "SKIP_WAITING" });
        }
      };

      if (registration.waiting) promote(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const sw = registration.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => promote(sw));
      });

      // Vérifie les mises à jour périodiquement et au retour en focus
      setInterval(() => registration.update().catch(() => {}), 60_000);
      window.addEventListener("focus", () => registration.update().catch(() => {}));
    } catch {
      /* noop */
    }
  });
} else if ("serviceWorker" in navigator) {
  // Hors production : désinscrire tout SW existant et purger les caches
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}
