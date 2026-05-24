import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/admin-helpers";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const ok = await isCurrentUserAdmin();
      if (!ok) {
        await supabase.auth.signOut();
        throw new Error("Ce compte n'est pas administrateur.");
      }
      toast({ title: "Connecté", description: "Bienvenue dans la console admin." });
      navigate("/admin");
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
          <h1 className="text-3xl font-serif font-bold text-primary-foreground flex items-center gap-3">
            <Shield className="w-8 h-8" /> Espace Administrateur
          </h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 py-8">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email admin</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwd">Mot de passe</Label>
            <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
          <p className="text-xs text-muted-foreground text-center font-sans">
            Pas encore configuré ?{" "}
            <Link to="/admin/setup" className="text-primary hover:underline">Créer le compte administrateur</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
