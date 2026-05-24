import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PendingRequestPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card rounded-xl p-8 max-w-md text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
          <Clock className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Demande envoyée</h1>
        <p className="text-muted-foreground font-sans">
          Votre demande d'adhésion au RENAMCI a bien été enregistrée. <br />
          <strong className="text-foreground">Votre demande est en cours de traitement.</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Vous recevrez une confirmation dès qu'un administrateur aura validé votre inscription.
        </p>
        <Button asChild className="w-full"><Link to="/">Retour à l'accueil</Link></Button>
      </div>
    </div>
  );
}
