import logoRenamci from "@/assets/logo-renamci.png";

const HeroSection = () => {
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
      </div>
    </header>
  );
};

export default HeroSection;
