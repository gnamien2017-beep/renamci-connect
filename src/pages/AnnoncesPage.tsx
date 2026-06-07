import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, Calendar, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import emptyAnnouncements from "@/assets/empty-announcements.png";
import { getSession } from "@/lib/auth-session";

type Announcement = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  published: boolean;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const AnnoncesPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(Boolean(session?.is_admin));
    const ch = supabase
      .channel("announcements-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.is_admin]);

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, image_url, created_at, published")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Announcement[]) ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-header py-8 px-4 border-b-4 border-accent">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary-foreground flex items-center gap-3">
              <Megaphone className="w-7 h-7" />
              Annonces officielles
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1 font-sans">
              Communications du Bureau Exécutif de la RÉNAMCI
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => navigate("/admin/annonces")}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Gérer les annonces
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Chargement...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <img src={emptyAnnouncements} alt="" className="w-40 h-40 object-contain mx-auto mb-4 opacity-80" />
            <h2 className="font-serif text-xl text-foreground">Aucune annonce pour le moment</h2>
            <p className="text-muted-foreground text-sm mt-2 font-sans">
              Les communications officielles apparaîtront ici dès leur publication.
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {items.map((a, i) => (
              <li
                key={a.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all animate-fade-in"
              >
                {a.image_url ? (
                  <div className="aspect-[21/9] bg-muted overflow-hidden">
                    <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs text-accent font-bold uppercase tracking-widest mb-2">
                    {i === 0 && <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full">Nouveau</span>}
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(a.created_at)}
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground leading-tight">{a.title}</h2>
                  <div className="mt-3 text-foreground/80 font-sans whitespace-pre-wrap leading-relaxed">
                    {a.content}
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

export default AnnoncesPage;
