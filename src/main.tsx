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
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* noop */
    });
  });
} else if ("serviceWorker" in navigator) {
  // Sur tout autre contexte (aperçu Lovable, iframe, localhost, custom domain non listé) :
  // désinscrire tout SW existant et purger les caches pour éviter du contenu obsolète.
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}
