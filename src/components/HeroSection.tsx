import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoRenamci from "@/assets/logo-renamci.png";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <header className="gradient-header py-12 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 animate-fade-in">
        <img
          src={logoRenamci}
          alt="Logo RENAMCI"
          className="w-28 h-28 object-contain drop-shadow-lg"
        />
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground leading-tight">
            RENAMCI
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mt-2 font-sans font-light tracking-wide">
            Réseau des Énarques Musulmans de Côte d'Ivoire
          </p>
        </div>
        <div className="w-24 h-1 gradient-gold rounded-full mt-2" />
        <p className="text-primary-foreground/70 text-sm font-sans max-w-lg">
          Annuaire officiel des membres — Trombinoscope
        </p>
        <Button
          onClick={() => navigate("/inscription")}
          className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90 font-sans gap-2"
          size="lg"
        >
          <UserPlus className="w-5 h-5" />
          S'inscrire dans l'annuaire
        </Button>
      </div>
    </header>
  );
};

export default HeroSection;
