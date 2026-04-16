import { useNavigate } from "react-router-dom";
import { CORPS_METIERS, CORPS_COLORS } from "@/lib/supabase-helpers";
import { Building2, Landmark } from "lucide-react";

const ECOLE_CONFIG = {
  EGAD: {
    label: "École de Gestion Administrative et de la Diplomatie",
    icon: Building2,
  },
  EGEF: {
    label: "École de Gestion Économique et Financière",
    icon: Landmark,
  },
};

const CorpsMetierSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="section-title text-center mb-12">
          Explorer par <span className="gold-accent">Corps de Métier</span>
        </h2>

        {(["EGAD", "EGEF"] as const).map((ecole) => {
          const config = ECOLE_CONFIG[ecole];
          const Icon = config.icon;
          const corps = CORPS_METIERS.filter((c) => c.ecole === ecole);

          return (
            <div key={ecole} className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-serif font-bold text-foreground">
                  {ecole}
                </h3>
                <span className="text-xs text-muted-foreground font-sans hidden sm:inline">
                  — {config.label}
                </span>
              </div>

              <div
                className={`grid gap-3 mx-auto max-w-3xl ${
                  ecole === "EGAD" ? "grid-cols-2 sm:grid-cols-6" : "grid-cols-2 sm:grid-cols-3"
                }`}
              >
                {corps.map((c, idx) => {
                  const color = CORPS_COLORS[c.id] || { bg: "#2d6a4f", text: "#ffffff" };

                  // EGAD: 3 en haut (cols 1-2, 3-4, 5-6), 2 en bas centrés (cols 2-3, 4-5)
                  let positionClass = "";
                  if (ecole === "EGAD") {
                    const positions = [
                      "sm:col-span-2 sm:col-start-1",
                      "sm:col-span-2 sm:col-start-3",
                      "sm:col-span-2 sm:col-start-5",
                      "sm:col-span-2 sm:col-start-2",
                      "sm:col-span-2 sm:col-start-4",
                    ];
                    positionClass = positions[idx] || "";
                  }

                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/corps/${c.id}`)}
                      className={`corps-metier-btn h-20 flex items-center justify-center ${positionClass}`}
                      style={{
                        background: `linear-gradient(145deg, ${color.bg}cc, ${color.bg})`,
                        boxShadow: `0 6px 12px ${color.bg}40, 0 2px 0 ${color.bg}88, inset 0 -3px 0 ${color.bg}dd`,
                        color: color.text,
                      }}
                    >
                      {c.label.toUpperCase()}
                      {c.abbrev && (
                        <span className="block text-[10px] font-normal opacity-70 mt-0.5">
                          ({c.abbrev})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CorpsMetierSection;
