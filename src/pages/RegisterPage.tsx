import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GRADES, GRADE_LABELS, type Grade } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenoms.trim() || !form.grade) {
      toast({ title: "Erreur", description: "Nom, prénoms et grade sont obligatoires.", variant: "destructive" });
      return;
    }
    if (form.password.length < 4) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 4 caractères.", variant: "destructive" });
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

      const { data, error } = await supabase.functions.invoke("register-profile", {
        body: cleaned,
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
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 font-sans text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
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
              <Label htmlFor="specialisation_ena">Spécialisation ENA</Label>
              <Input id="specialisation_ena" value={form.specialisation_ena} onChange={(e) => updateField("specialisation_ena", e.target.value)} maxLength={200} />
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
                  minLength={4}
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
                minLength={4}
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
