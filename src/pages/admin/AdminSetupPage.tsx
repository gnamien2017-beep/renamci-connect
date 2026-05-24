import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: { email: email.trim().toLowerCase(), password },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast({ title: "Compte admin créé", description: "Vous pouvez maintenant vous connecter." });
      navigate("/admin/connexion");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-header py-8 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-serif font-bold text-primary-foreground flex items-center gap-3">
            <Shield className="w-7 h-7" /> Configuration administrateur
          </h1>
          <p className="text-primary-foreground/70 text-xs mt-1 font-sans">
            Cette page n'est utilisable qu'une seule fois pour créer le premier compte administrateur.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 py-8">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="space-y-2"><Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Mot de passe (min. 8 caractères)</Label>
            <Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Confirmer le mot de passe</Label>
            <Input type="password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Création..." : "Créer le compte administrateur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
