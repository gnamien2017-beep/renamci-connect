import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/admin-helpers";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "deny">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const ok = await isCurrentUserAdmin();
      if (active) setState(ok ? "ok" : "deny");
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      isCurrentUserAdmin().then((ok) => active && setState(ok ? "ok" : "deny"));
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  if (state === "loading") return <div className="p-8 text-center text-muted-foreground">Vérification...</div>;
  if (state === "deny") return <Navigate to="/admin/connexion" replace />;
  return <>{children}</>;
}
