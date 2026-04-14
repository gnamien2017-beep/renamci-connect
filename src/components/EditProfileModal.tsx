import { useState, useRef } from "react";
import type { Profile } from "@/lib/supabase-helpers";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GRADES, GRADE_LABELS, CORPS_METIERS } from "@/lib/supabase-helpers";
import { Camera, User } from "lucide-react";

interface EditProfileModalProps {
  profile: Profile;
  password: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EditProfileModal = ({ profile, password, open, onClose, onSaved }: EditProfileModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nom: profile.nom,
    prenoms: profile.prenoms,
    sexe: profile.sexe,
    grade: profile.grade,
    fonction: profile.fonction || "",
    profession: profile.profession || "",
    direction: profile.direction || "",
    ministere: profile.ministere || "",
    contact: profile.contact || "",
    email: profile.email || "",
    adresse: profile.adresse || "",
    specialisation_ena: profile.specialisation_ena || "",
    promotion_ena: profile.promotion_ena || "",
    formation_initiale: profile.formation_initiale || "",
    domaines_expertise: profile.domaines_expertise || "",
    valeurs: profile.valeurs || "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erreur", description: "La photo ne doit pas dépasser 5 Mo.", variant: "destructive" });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prenoms.trim()) {
      toast({ title: "Erreur", description: "Nom et prénoms sont obligatoires.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const updates: Record<string, any> = {};
      for (const [k, v] of Object.entries(form)) {
        updates[k] = typeof v === "string" && v.trim() === "" && k !== "nom" && k !== "prenoms" ? null : v;
      }

      // Upload new photo if changed
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, photoFile, { contentType: photoFile.type });
        if (uploadError) throw new Error("Erreur lors de l'upload de la photo");
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        updates.photo_url = urlData.publicUrl;
      }

      const { data, error } = await supabase.functions.invoke("manage-profile", {
        body: {
          action: "update",
          profile_id: profile.id,
          password,
          updates,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Erreur lors de la mise à jour");
      }

      toast({ title: "Succès", description: "Profil mis à jour avec succès." });
      onSaved();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-xl font-bold text-foreground">Modifier le profil</h2>

        {/* Photo */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-primary/30 flex items-center justify-center group hover:border-primary/60 transition-colors"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground/40" />
            )}
            <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nom *</Label>
            <Input value={form.nom} onChange={(e) => updateField("nom", e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Prénoms *</Label>
            <Input value={form.prenoms} onChange={(e) => updateField("prenoms", e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sexe</Label>
            <Select value={form.sexe} onValueChange={(v) => updateField("sexe", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Homme">Homme</SelectItem>
                <SelectItem value="Femme">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Grade</Label>
            <Select value={form.grade} onValueChange={(v) => updateField("grade", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>{GRADE_LABELS[g]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fonction</Label>
            <Input value={form.fonction} onChange={(e) => updateField("fonction", e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Profession</Label>
            <Input value={form.profession} onChange={(e) => updateField("profession", e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Direction</Label>
            <Input value={form.direction} onChange={(e) => updateField("direction", e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ministère</Label>
            <Input value={form.ministere} onChange={(e) => updateField("ministere", e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Téléphone</Label>
            <Input value={form.contact} onChange={(e) => updateField("contact", e.target.value)} maxLength={20} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Adresse</Label>
            <Input value={form.adresse} onChange={(e) => updateField("adresse", e.target.value)} maxLength={300} />
          </div>
           <div className="space-y-1">
            <Label className="text-xs">Corps de métier</Label>
            <Select value={form.specialisation_ena} onValueChange={(v) => updateField("specialisation_ena", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
              <SelectContent>
                {CORPS_METIERS.map((c) => (
                  <SelectItem key={c.id} value={c.label}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Promotion ENA</Label>
            <Input value={form.promotion_ena} onChange={(e) => updateField("promotion_ena", e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Formation initiale</Label>
            <Input value={form.formation_initiale} onChange={(e) => updateField("formation_initiale", e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Domaines d'expertise</Label>
            <Textarea value={form.domaines_expertise} onChange={(e) => updateField("domaines_expertise", e.target.value)} maxLength={500} rows={2} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Valeurs</Label>
            <Textarea value={form.valeurs} onChange={(e) => updateField("valeurs", e.target.value)} maxLength={500} rows={2} />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
