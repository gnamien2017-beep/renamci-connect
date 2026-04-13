import { useNavigate } from "react-router-dom";
import { CORPS_METIERS, CORPS_COLORS, GRADE_COLORS_HEX } from "@/lib/supabase-helpers";
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

              <div className="space-y-6">
                {corps.map((c) => {
                  const color = CORPS_COLORS[c.id] || { bg: "#2d6a4f", text: "#ffffff" };

                  return (
                    <div key={c.id} className="glass-card rounded-2xl p-5 animate-fade-in">
                      {/* Corps header */}
                      <h4
                        className="text-base font-sans font-bold tracking-wide mb-4 uppercase"
                        style={{ color: color.bg }}
                      >
                        {c.label}
                        {c.abbrev && (
                          <span className="text-xs font-normal opacity-70 ml-2">
                            ({c.abbrev})
                          </span>
                        )}
                      </h4>

                      {/* Grade buttons */}
                      <div className="flex flex-wrap gap-2">
                        {c.grades.map((grade) => {
                          const gradeColor = GRADE_COLORS_HEX[grade];
                          return (
                            <button
                              key={grade}
                              onClick={() => navigate(`/corps/${c.id}/${grade}`)}
                              className="corps-grade-btn"
                              style={{
                                background: `linear-gradient(145deg, ${gradeColor.light}, ${gradeColor.main})`,
                                boxShadow: `0 4px 6px ${gradeColor.main}40, 0 2px 0 ${gradeColor.light}, inset 0 -2px 0 ${gradeColor.dark}`,
                                color: "#fff",
                              }}
                            >
                              {grade}
                            </button>
                          );
                        })}
                      </div>
                    </div>
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
