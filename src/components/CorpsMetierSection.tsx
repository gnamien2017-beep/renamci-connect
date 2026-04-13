import { useNavigate } from "react-router-dom";
import { CORPS_METIERS } from "@/lib/supabase-helpers";
import { Building2, Landmark } from "lucide-react";

const ECOLE_CONFIG = {
  EGAD: {
    label: "École de Gestion Administrative et de la Diplomatie",
    icon: Building2,
    color: "from-emerald-600 to-emerald-800",
  },
  EGEF: {
    label: "École de Gestion Économique et Financière",
    icon: Landmark,
    color: "from-amber-600 to-amber-800",
  },
};

const CorpsMetierSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="section-title text-center mb-12">
          Explorer par <span className="gold-accent">Corps de Métier</span>
        </h2>

        {(["EGAD", "EGEF"] as const).map((ecole) => {
          const config = ECOLE_CONFIG[ecole];
          const Icon = config.icon;
          const corps = CORPS_METIERS.filter((c) => c.ecole === ecole);

          return (
            <div key={ecole} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-serif font-bold text-foreground">
                  {ecole}
                </h3>
                <span className="text-xs text-muted-foreground font-sans hidden sm:inline">
                  — {config.label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {corps.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/corps/${c.id}`)}
                    className={`
                      group relative overflow-hidden rounded-xl p-4 text-left
                      bg-gradient-to-br ${config.color} text-white
                      shadow-md hover:shadow-xl hover:-translate-y-1
                      transition-all duration-300 ease-out
                      animate-fade-in
                    `}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                    <span className="relative z-10 block text-sm font-semibold font-sans leading-tight">
                      {c.label}
                    </span>
                    {c.abbrev && (
                      <span className="relative z-10 block text-xs font-sans opacity-70 mt-1">
                        ({c.abbrev})
                      </span>
                    )}
                    <span className="relative z-10 block text-[10px] font-sans opacity-60 mt-2">
                      {c.grades[0]} → {c.grades[c.grades.length - 1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CorpsMetierSection;
