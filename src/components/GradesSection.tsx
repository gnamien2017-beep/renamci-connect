import { useNavigate } from "react-router-dom";
import { GRADES, GRADE_LABELS, GRADE_COLORS } from "@/lib/supabase-helpers";

const GradesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="section-title text-center mb-10">
          Explorer par <span className="gold-accent">Grade</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {GRADES.map((grade, i) => (
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
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GradesSection;
