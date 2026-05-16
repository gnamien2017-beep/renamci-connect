import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-password-reset", {
        body: { email: email.trim().toLowerCase(), origin: window.location.origin },
      });
      if (error || data?.error) {
        throw new Error(data?.error || "Une erreur est survenue");
      }
      setSent(true);
      toast({
        title: "Email envoyé",
        description: "Si cet email correspond à un profil, vous recevrez un lien de réinitialisation sous peu.",
      });
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
            <Mail className="w-8 h-8" />
            Mot de passe oublié
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="glass-card rounded-xl p-6 space-y-4">
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="font-sans text-foreground">
                Si l'email <strong>{email}</strong> correspond à un profil, un lien de réinitialisation vient d'être envoyé.
              </p>
              <p className="text-sm text-muted-foreground font-sans">
                Vérifiez votre boîte de réception (et les spams). Le lien expire dans 1 heure.
              </p>
              <Link to="/connexion" className="text-primary hover:underline text-sm">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground font-sans">
                Entrez l'email associé à votre profil — nous vous enverrons un lien sécurisé pour définir un nouveau mot de passe.
              </p>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading || !email.trim()}>
                {loading ? "Envoi..." : "Envoyer le lien"}
              </Button>
              <Link to="/connexion" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
