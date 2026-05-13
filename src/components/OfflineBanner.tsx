import { useEffect, useState } from "react";
import { WifiOff, CloudUpload } from "lucide-react";
import { pendingCount } from "@/lib/offline-sync";

const OfflineBanner = () => {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const tick = async () => setPending(await pendingCount());
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      clearInterval(id);
    };
  }, []);

  if (online && pending === 0) return null;

  return (
    <div
      className={`w-full text-center text-xs font-sans py-1.5 px-3 ${
        online ? "bg-accent/20 text-accent-foreground" : "bg-destructive/10 text-destructive"
      }`}
      role="status"
    >
      {!online ? (
        <span className="inline-flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          Mode hors-ligne — les données affichées proviennent du cache local.
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          <CloudUpload className="w-3.5 h-3.5" />
          {pending} profil{pending > 1 ? "s" : ""} en attente de synchronisation…
        </span>
      )}
    </div>
  );
};

export default OfflineBanner;
