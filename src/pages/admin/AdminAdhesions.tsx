import { useEffect, useState } from "react";
import { Check, X, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { fetchProfilesByStatus, setProfileStatus, markAllNotificationsRead, type ProfileStatus } from "@/lib/admin-helpers";
import type { Profile } from "@/lib/supabase-helpers";

function ProfilesList({ status, onAction }: { status: ProfileStatus; onAction: () => void }) {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchProfilesByStatus(status).then((p) => { setProfiles(p); setLoading(false); });
  };
  useEffect(load, [status]);

  const handle = async (id: string, s: ProfileStatus, name: string) => {
    try {
      await setProfileStatus(id, s);
      toast({ title: s === "approved" ? "Demande acceptée" : "Demande refusée", description: name });
      load(); onAction();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  if (loading) return <p className="text-muted-foreground text-sm">Chargement...</p>;
  if (!profiles.length) return <p className="text-muted-foreground text-sm">Aucune demande.</p>;

  return (
    <div className="space-y-3">
      {profiles.map((p) => (
        <div key={p.id} className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-primary/20">
            {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> :
              <span className="text-sm font-bold text-muted-foreground">{p.prenoms[0]}{p.nom[0]}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-semibold text-foreground">{p.nom.toUpperCase()} {p.prenoms}</p>
            <p className="text-xs text-muted-foreground">
              {p.grade}{p.fonction ? ` · ${p.fonction}` : ""}{p.ministere ? ` · ${p.ministere}` : ""}
            </p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
              {p.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</span>}
              {p.contact && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.contact}</span>}
            </div>
          </div>
          {status === "pending" && (
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={() => handle(p.id, "approved", `${p.prenoms} ${p.nom}`)} className="bg-green-700 hover:bg-green-800">
                <Check className="w-4 h-4 mr-1" /> Accepter
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handle(p.id, "rejected", `${p.prenoms} ${p.nom}`)}>
                <X className="w-4 h-4 mr-1" /> Refuser
              </Button>
            </div>
          )}
          {status !== "pending" && (
            <span className={`text-xs px-2 py-1 rounded ${status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {status === "approved" ? "Accepté" : "Refusé"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminAdhesions() {
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { markAllNotificationsRead().catch(() => {}); }, []);
  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">En attente</TabsTrigger>
        <TabsTrigger value="approved">Acceptées</TabsTrigger>
        <TabsTrigger value="rejected">Refusées</TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="mt-4"><ProfilesList key={`p-${refresh}`} status="pending" onAction={() => setRefresh((r) => r + 1)} /></TabsContent>
      <TabsContent value="approved" className="mt-4"><ProfilesList key={`a-${refresh}`} status="approved" onAction={() => setRefresh((r) => r + 1)} /></TabsContent>
      <TabsContent value="rejected" className="mt-4"><ProfilesList key={`r-${refresh}`} status="rejected" onAction={() => setRefresh((r) => r + 1)} /></TabsContent>
    </Tabs>
  );
}
