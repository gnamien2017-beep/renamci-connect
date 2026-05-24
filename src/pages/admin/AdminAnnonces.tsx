import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, type Announcement,
} from "@/lib/admin-helpers";

export default function AdminAnnonces() {
  const { toast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

  const load = () => fetchAnnouncements(false).then(setItems);
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ id: "", title: "", content: "", image_url: null, published: true, created_at: "", updated_at: "" }); setOpen(true); };
  const openEdit = (a: Announcement) => { setEditing(a); setOpen(true); };

  const handleSave = async (a: Announcement, file: File | null) => {
    try {
      let image_url = a.image_url;
      if (file) {
        const ext = file.name.split(".").pop();
        const name = `announcement-${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("photos").upload(name, file, { contentType: file.type });
        if (error) throw error;
        image_url = supabase.storage.from("photos").getPublicUrl(name).data.publicUrl;
      }
      if (a.id) await updateAnnouncement(a.id, { title: a.title, content: a.content, image_url, published: a.published });
      else await createAnnouncement({ title: a.title, content: a.content, image_url, published: a.published });
      toast({ title: "Enregistré" });
      setOpen(false); load();
    } catch (e: any) { toast({ title: "Erreur", description: e.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await deleteAnnouncement(id);
    toast({ title: "Supprimée" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-xl">Annonces</h2>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Nouvelle annonce</Button>
      </div>

      {items.length === 0 && <p className="text-muted-foreground text-sm">Aucune annonce pour le moment.</p>}

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="glass-card rounded-xl p-4 flex gap-3">
            {a.image_url && <img src={a.image_url} alt="" className="w-20 h-20 rounded object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-semibold text-foreground truncate">{a.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${a.published ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                  {a.published ? "Publiée" : "Brouillon"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{a.content}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      {editing && <EditDialog open={open} onOpenChange={setOpen} value={editing} onSave={handleSave} />}
    </div>
  );
}

function EditDialog({
  open, onOpenChange, value, onSave,
}: { open: boolean; onOpenChange: (b: boolean) => void; value: Announcement; onSave: (a: Announcement, f: File | null) => void; }) {
  const [a, setA] = useState<Announcement>(value);
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => { setA(value); setFile(null); }, [value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{a.id ? "Modifier l'annonce" : "Nouvelle annonce"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Titre</Label>
            <Input value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Contenu</Label>
            <Textarea rows={6} value={a.content} onChange={(e) => setA({ ...a, content: e.target.value })} /></div>
          <div className="space-y-2"><Label>Image (optionnel)</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {a.image_url && !file && <img src={a.image_url} alt="" className="w-24 h-24 rounded object-cover mt-2" />}
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={a.published} onCheckedChange={(v) => setA({ ...a, published: v })} />
            <Label>Publier</Label>
          </div>
          <Button onClick={() => onSave(a, file)} className="w-full" disabled={!a.title.trim() || !a.content.trim()}>Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
