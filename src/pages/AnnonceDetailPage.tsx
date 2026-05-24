import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { fetchAnnouncement, type Announcement } from "@/lib/admin-helpers";

export default function AnnonceDetailPage() {
  const { id } = useParams();
  const [a, setA] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (id) fetchAnnouncement(id).then((d) => { setA(d); setLoading(false); }); }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement...</div>;
  if (!a) return <div className="p-8 text-center text-muted-foreground">Annonce introuvable.</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/annonces" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour aux annonces
        </Link>
        <article className="glass-card rounded-xl overflow-hidden">
          {a.image_url && <img src={a.image_url} alt={a.title} className="w-full max-h-80 object-cover" />}
          <div className="p-6 space-y-3">
            <h1 className="text-3xl font-serif font-bold text-foreground">{a.title}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <div className="prose font-sans text-foreground whitespace-pre-wrap leading-relaxed pt-2">{a.content}</div>
          </div>
        </article>
      </div>
    </div>
  );
}
