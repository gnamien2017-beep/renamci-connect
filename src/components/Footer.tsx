import { useNavigate } from "react-router-dom";
import logoRenamci from "@/assets/logo-renamci.png";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="gradient-header py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-3">
            <img src={logoRenamci} alt="Logo RENAMCI" className="w-10 h-10 object-contain rounded-full" />
            <span className="font-serif text-lg font-bold text-primary-foreground">RENAMCI</span>
          </div>
          <p className="text-primary-foreground/70 text-xs font-sans text-center md:text-left max-w-xs">
            Réseau des Énarques Musulmans de Côte d'Ivoire — Plateforme de mise en réseau et annuaire des membres.
          </p>
        </div>

        {/* Liens rapides */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <h4 className="font-serif text-sm font-bold text-primary-foreground mb-1">Liens rapides</h4>
          <button onClick={() => navigate("/")} className="text-primary-foreground/70 text-xs font-sans hover:text-primary-foreground transition-colors">
            Accueil
          </button>
          <button onClick={() => navigate("/inscription")} className="text-primary-foreground/70 text-xs font-sans hover:text-primary-foreground transition-colors">
            S'inscrire
          </button>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <h4 className="font-serif text-sm font-bold text-primary-foreground mb-1">Contact</h4>
          <p className="text-primary-foreground/70 text-xs font-sans">Abidjan, Côte d'Ivoire</p>
          <p className="text-primary-foreground/70 text-xs font-sans">renamci@gmail.com</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 pt-4 border-t border-white/15">
        <p className="text-center text-primary-foreground/50 text-xs font-sans">
          © {new Date().getFullYear()} RENAMCI — Tous droits réservés
        </p>
      </div>
    </footer>
  );
};

export default Footer;
