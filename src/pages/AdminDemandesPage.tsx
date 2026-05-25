import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSession } from "@/lib/auth-session";

type PendingProfile = {
  id: string;
  nom: string;
  prenoms: string;
  email: string | null;
  contact: string | null;
  grade: string;
  ministere: string | null;
  specialisation_ena: string | null;
  promotion_ena: string | null;
  created_at: string;
};

const AdminDemandesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = getSession();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      navigate("/connexion");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.profileId)
        .maybeSingle();
      setIsAdmin(Boolean((data as any)?.is_admin));
    })();
  }, [session, navigate]);

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ["pending-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nom, prenoms, email, contact, grade, ministere, specialisation_ena, promotion_ena, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as PendingProfile[]) ?? [];
    },
    enabled: isAdmin === true,
  });

  const moderate = async (targetProfileId: string, decision: "approved" | "rejected") => {
    if (!session) return;
    try {
      const { data, error } = await supabase.functions.invoke("moderate-membership", {
        body: { adminProfileId: session.profileId, password: session.password, targetProfileId, decision },
      });
      if (error || data?.error) throw new Error(data?.error || "Erreur");
      toast({
        title: decision === "approved" ? "Demande acceptée" : "Demande refusée",
        description: decision === "approved" ? "Le membre peut désormais se connecter." : "Le membre a été notifié.",
      });
      qc.invalidateQueries({ queryKey: ["pending-profiles"] });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  if (isAdmin === null) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-xl font-serif font-semibold">Accès réservé aux administrateurs</h1>
          <Button onClick={() => navigate("/")} className="mt-4">Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-header py-6 px-4 border-b-4 border-accent">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-serif font-bold text-primary-foreground flex items-center gap-3">
            <ShieldCheck className="w-7 h-7" />
            Demandes d'adhésion
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            {pending.length} demande{pending.length > 1 ? "s" : ""} en attente de validation
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Chargement...</p>
        ) : pending.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-sans">Aucune demande en attente. Tout est à jour.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold">
                      {p.prenoms[0]}{p.nom[0]}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        {p.prenoms} {p.nom.toUpperCase()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Grade {p.grade}
                        {p.specialisation_ena && ` · ${p.specialisation_ena}`}
                        {p.promotion_ena && ` · Promo ${p.promotion_ena}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.email && <>📧 {p.email}{p.contact ? " · " : ""}</>}
                        {p.contact && <>📞 {p.contact}</>}
                      </p>
                      {p.ministere && (
                        <p className="text-xs text-muted-foreground">🏛️ {p.ministere}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        Envoyé le {new Date(p.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => moderate(p.id, "approved")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Accepter
                    </Button>
                    <Button
                      onClick={() => moderate(p.id, "rejected")}
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                    >
                      <X className="w-4 h-4" /> Refuser
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDemandesPage;
