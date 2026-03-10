import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GRADES, GRADE_LABELS, GRADE_COLORS, fetchStats } from "@/lib/supabase-helpers";
import { Users } from "lucide-react";

const GradesSection = () => {
  const navigate = useNavigate();
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="section-title text-center mb-10">
          Explorer par <span className="gold-accent">Grade</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {GRADES.map((grade, i) => {
            const count = stats?.gradeCount[grade] ?? 0;
            return (
              <button
                key={grade}
                onClick={() => navigate(`/grade/${grade}`)}
                className={`grade-button ${GRADE_COLORS[grade]} animate-fade-in`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="relative z-10 drop-shadow-md">{grade}</span>
                <span className="block text-sm font-sans font-normal opacity-80 mt-1 relative z-10">
                  {GRADE_LABELS[grade]}
                </span>
                {stats && (
                  <span className="flex items-center justify-center gap-1 text-xs font-sans font-medium opacity-70 mt-2 relative z-10">
                    <Users className="w-3.5 h-3.5" />
                    {count} membre{count > 1 ? "s" : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GradesSection;
