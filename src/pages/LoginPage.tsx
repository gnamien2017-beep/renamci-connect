import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { setSession } from "@/lib/auth-session";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("login-profile", {
        body: { email: email.trim().toLowerCase(), password },
      });
      if (error || data?.error) {
        throw new Error(data?.error || "Identifiants invalides");
      }
      setSession({
        profileId: data.profile.id,
        email: data.profile.email,
        nom: data.profile.nom,
        prenoms: data.profile.prenoms,
        password,
        is_admin: data.profile.is_admin,
      });
      toast({ title: "Connexion réussie", description: `Bienvenue, ${data.profile.prenoms} !` });
      navigate("/");
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
            <LogIn className="w-8 h-8" />
            Connexion
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1 font-sans">
            Connectez-vous avec votre email et votre mot de passe.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="flex justify-between text-sm font-sans pt-2">
            <Link to="/mot-de-passe-oublie" className="text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
            <Link to="/inscription" className="text-muted-foreground hover:text-foreground">
              Créer un compte
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
