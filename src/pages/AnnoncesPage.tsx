import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, Calendar } from "lucide-react";
import { fetchAnnouncements, type Announcement } from "@/lib/admin-helpers";

export default function AnnoncesPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchAnnouncements(true).then((d) => { setItems(d); setLoading(false); }); }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-header py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-primary-foreground flex items-center gap-3">
            <Megaphone className="w-8 h-8" /> Annonces
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1 font-sans">Actualités et communiqués du RENAMCI.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {loading && <p className="text-muted-foreground">Chargement...</p>}
        {!loading && items.length === 0 && (
          <p className="text-center text-muted-foreground py-12 font-sans">Aucune annonce pour le moment.</p>
        )}
        {items.map((a) => (
          <Link key={a.id} to={`/annonces/${a.id}`} className="block glass-card rounded-xl p-5 hover:shadow-lg transition">
            <div className="flex gap-4">
              {a.image_url && <img src={a.image_url} alt="" className="w-28 h-28 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <h2 className="font-serif font-bold text-xl text-foreground">{a.title}</h2>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-sm text-foreground/80 mt-2 line-clamp-3">{a.content}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
