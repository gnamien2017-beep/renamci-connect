import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/lib/supabase-helpers";
import logoRenamci from "@/assets/logo-renamci.png";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  return (
    <header className="gradient-header py-16 md:py-24 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-5 animate-fade-in relative z-10">
        <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm p-2 shadow-2xl border border-white/20">
          <img
            src={logoRenamci}
            alt="Logo RENAMCI"
            className="w-full h-full object-contain drop-shadow-lg rounded-full"
          />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground leading-tight tracking-wide">
            RENAMCI
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 mt-2 font-sans font-light tracking-wide">
            Réseau des Énarques Musulmans de Côte d'Ivoire
          </p>
        </div>

        {/* Bande décorative dorée */}
        <div className="w-32 h-1 gradient-gold rounded-full" />

        {stats && stats.total > 0 ? (
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/20">
            <Users className="w-5 h-5 text-primary-foreground/90" />
            <span className="text-primary-foreground font-serif text-xl font-bold">
              <AnimatedCounter target={stats.total} />
            </span>
            <span className="text-primary-foreground/80 text-sm font-sans">
              membre{stats.total > 1 ? "s" : ""} enregistré{stats.total > 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <p className="text-primary-foreground/70 text-sm font-sans max-w-lg">
            Annuaire officiel des membres — Trombinoscope
          </p>
        )}

        {/* Boutons CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-sans font-semibold px-8 shadow-lg"
            onClick={() => navigate("/grade/A7")}
          >
            Explorer l'annuaire
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-[hsl(var(--gold))] text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/10 font-sans font-semibold px-8"
            onClick={() => navigate("/inscription")}
          >
            Rejoindre RENAMCI
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
