import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import GradesSection from "@/components/GradesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <GradesSection />
      <footer className="py-6 text-center text-xs text-muted-foreground font-sans border-t border-border">
        © {new Date().getFullYear()} RENAMCI — Réseau des Énarques Musulmans de Côte d'Ivoire
      </footer>
    </div>
  );
};

export default Index;
