import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Trash2, Eye, EyeOff, Image as ImageIcon, X, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSession } from "@/lib/auth-session";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Announcement = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
};

const fileToBase64 = (file: File): Promise<{ b64: string; mime: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(",")[1] ?? "";
      resolve({ b64, mime: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AdminAnnoncesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const session = getSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) { navigate("/connexion"); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles").select("is_admin").eq("id", session.profileId).maybeSingle();
      setIsAdmin(Boolean((data as any)?.is_admin));
    })();
  }, [session, navigate]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, image_url, published, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Announcement[]) ?? [];
    },
    enabled: isAdmin === true,
  });

  const handleFile = (f: File | null) => {
    setImageFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const publish = async () => {
    if (!session) return;
    if (!title.trim() || !content.trim()) {
      toast({ title: "Champs requis", description: "Titre et contenu obligatoires", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        profileId: session.profileId, password: session.password,
        action: "create", title, content, published: true,
      };
      if (imageFile) {
        const { b64, mime } = await fileToBase64(imageFile);
        payload.imageBase64 = b64;
        payload.imageMime = mime;
      }
      const { data, error } = await supabase.functions.invoke("manage-announcement", { body: payload });
      if (error || data?.error) throw new Error(data?.error || "Erreur");
      toast({ title: "Annonce publiée", description: "Tous les membres peuvent la consulter." });
      setTitle(""); setContent(""); handleFile(null);
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublished = async (a: Announcement) => {
    if (!session) return;
    const { data, error } = await supabase.functions.invoke("manage-announcement", {
      body: { profileId: session.profileId, password: session.password, action: "update", announcementId: a.id, published: !a.published },
    });
    if (error || data?.error) {
      toast({ title: "Erreur", description: data?.error || "Erreur", variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    qc.invalidateQueries({ queryKey: ["announcements"] });
  };

  const doDelete = async () => {
    if (!session || !deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    const { data, error } = await supabase.functions.invoke("manage-announcement", {
      body: { profileId: session.profileId, password: session.password, action: "delete", announcementId: id },
    });
    if (error || data?.error) {
      toast({ title: "Erreur", description: data?.error || "Erreur", variant: "destructive" });
      return;
    }
    toast({ title: "Annonce supprimée" });
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    qc.invalidateQueries({ queryKey: ["announcements"] });
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-serif font-bold text-primary-foreground flex items-center gap-3">
            <Megaphone className="w-7 h-7" />
            Gestion des annonces
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1 font-sans">
            Publiez les communications officielles destinées à l'ensemble des membres.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        {/* Composer */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" /> Nouvelle annonce
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wide">Titre</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Assemblée générale du 12 juillet"
                className="mt-1"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wide">Contenu</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Rédigez le message à transmettre aux membres..."
                rows={8}
                className="mt-1 font-sans"
                maxLength={4000}
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{content.length}/4000</p>
            </div>
            <div>
              <label className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wide">
                Image (optionnelle)
              </label>
              {previewUrl ? (
                <div className="relative mt-1 rounded-lg overflow-hidden border border-border">
                  <img src={previewUrl} alt="" className="w-full max-h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleFile(null)}
                    className="absolute top-2 right-2 bg-background/90 hover:bg-background rounded-full p-1.5 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-6 cursor-pointer hover:border-primary/50 transition-colors text-sm text-muted-foreground">
                  <ImageIcon className="w-5 h-5" />
                  Cliquer pour ajouter une image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>
            <Button
              onClick={publish}
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {submitting ? "Publication..." : "Publier l'annonce"}
            </Button>
          </div>
        </section>

        {/* List */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
            Annonces ({items.length})
          </h2>
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground text-sm font-sans">Aucune annonce publiée.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((a) => (
                <li
                  key={a.id}
                  className={`bg-card border rounded-xl p-4 shadow-sm transition-all ${
                    a.published ? "border-border" : "border-dashed border-muted-foreground/30 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {a.image_url && (
                      <img src={a.image_url} alt="" className="w-16 h-16 rounded-md object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-foreground truncate">{a.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 font-sans">{a.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                          {new Date(a.created_at).toLocaleDateString("fr-FR")}
                        </span>
                        <span className={a.published ? "text-primary font-semibold" : "text-muted-foreground"}>
                          {a.published ? "Publiée" : "Brouillon"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => togglePublished(a)} title={a.published ? "Dépublier" : "Publier"}>
                        {a.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(a.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive et retire l'annonce pour tous les membres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAnnoncesPage;
