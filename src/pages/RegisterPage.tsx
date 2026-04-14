import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GRADES, GRADE_LABELS, CORPS_METIERS, type Grade } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nom: "",
    prenoms: "",
    sexe: "Homme" as "Homme" | "Femme",
    grade: "" as string,
    fonction: "",
    profession: "",
    direction: "",
    ministere: "",
    contact: "",
    email: "",
    adresse: "",
    specialisation_ena: "",
    promotion_ena: "",
    formation_initiale: "",
    domaines_expertise: "",
    valeurs: "",
    password: "",
    confirmPassword: "",
  });

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

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenoms.trim() || !form.grade) {
      toast({ title: "Erreur", description: "Nom, prénoms et grade sont obligatoires.", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      // Clean empty strings to null
      const cleaned: Record<string, any> = {};
      for (const [k, v] of Object.entries(submitData)) {
        cleaned[k] = typeof v === "string" && v.trim() === "" && k !== "nom" && k !== "prenoms" && k !== "password" ? null : v;
      }

      // Upload photo if provided
      let photo_url: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, photoFile, { contentType: photoFile.type });
        if (uploadError) throw new Error("Erreur lors de l'upload de la photo");
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        photo_url = urlData.publicUrl;
      }

      const { data, error } = await supabase.functions.invoke("register-profile", {
        body: { ...cleaned, photo_url },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Erreur lors de l'inscription");
      }

      toast({ title: "Succès !", description: "Votre profil a été créé avec succès." });
      navigate(`/grade/${form.grade}`);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-header py-8 px-4">
        <div className="max-w-2xl mx-auto">
          
          <h1 className="text-3xl font-serif font-bold text-primary-foreground flex items-center gap-3">
            <UserPlus className="w-8 h-8" />
            Nouveau Membre
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1 font-sans">
            Remplissez le formulaire pour vous inscrire dans l'annuaire
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Required fields */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">Informations obligatoires</h2>
          
          {/* Photo picker */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-primary/30 flex items-center justify-center group hover:border-primary/60 transition-colors"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground/40" />
              )}
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-primary-foreground" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground font-sans">Cliquez pour ajouter une photo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" value={form.nom} onChange={(e) => updateField("nom", e.target.value)} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenoms">Prénoms *</Label>
              <Input id="prenoms" value={form.prenoms} onChange={(e) => updateField("prenoms", e.target.value)} required maxLength={100} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sexe *</Label>
              <Select value={form.sexe} onValueChange={(v) => updateField("sexe", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homme">Homme</SelectItem>
                  <SelectItem value="Femme">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Grade *</Label>
              <Select value={form.grade} onValueChange={(v) => updateField("grade", v)}>
                <SelectTrigger><SelectValue placeholder="Choisir un grade" /></SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{GRADE_LABELS[g]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Professional info */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">Informations professionnelles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fonction">Fonction</Label>
              <Input id="fonction" value={form.fonction} onChange={(e) => updateField("fonction", e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input id="profession" value={form.profession} onChange={(e) => updateField("profession", e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Input id="direction" value={form.direction} onChange={(e) => updateField("direction", e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ministere">Ministère</Label>
              <Input id="ministere" value={form.ministere} onChange={(e) => updateField("ministere", e.target.value)} maxLength={200} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Téléphone</Label>
              <Input id="contact" value={form.contact} onChange={(e) => updateField("contact", e.target.value)} maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" value={form.adresse} onChange={(e) => updateField("adresse", e.target.value)} maxLength={300} />
            </div>
          </div>
        </div>

        {/* ENA */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">Formation ENA</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="specialisation_ena">Corps de métier (Spécialisation ENA) *</Label>
              <Select value={form.specialisation_ena} onValueChange={(v) => updateField("specialisation_ena", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez votre corps" /></SelectTrigger>
                <SelectContent>
                  {CORPS_METIERS.map((c) => (
                    <SelectItem key={c.id} value={c.label}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promotion_ena">Promotion ENA</Label>
              <Input id="promotion_ena" value={form.promotion_ena} onChange={(e) => updateField("promotion_ena", e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="formation_initiale">Formation initiale</Label>
              <Input id="formation_initiale" value={form.formation_initiale} onChange={(e) => updateField("formation_initiale", e.target.value)} maxLength={200} />
            </div>
          </div>
        </div>

        {/* Expertise */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">Expertise & Valeurs</h2>
          <div className="space-y-2">
            <Label htmlFor="domaines_expertise">Domaines d'expertise</Label>
            <Textarea id="domaines_expertise" value={form.domaines_expertise} onChange={(e) => updateField("domaines_expertise", e.target.value)} maxLength={500} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valeurs">Valeurs</Label>
            <Textarea id="valeurs" value={form.valeurs} onChange={(e) => updateField("valeurs", e.target.value)} maxLength={500} rows={3} />
          </div>
        </div>

        {/* Password */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">Mot de passe</h2>
          <p className="text-sm text-muted-foreground font-sans">Ce mot de passe protégera votre profil et vous permettra de le modifier ou le supprimer.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={6}
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required
                minLength={6}
                maxLength={50}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-sans" disabled={loading}>
          {loading ? "Inscription en cours..." : "S'inscrire"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
