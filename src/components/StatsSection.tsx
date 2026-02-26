import { useQuery } from "@tanstack/react-query";
import { fetchStats, GRADES } from "@/lib/supabase-helpers";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const GENDER_COLORS = ["hsl(145, 63%, 26%)", "hsl(43, 75%, 50%)"];
const GRADE_CHART_COLORS = [
  "hsl(145,63%,26%)",
  "hsl(200,70%,45%)",
  "hsl(43,75%,50%)",
  "hsl(340,65%,47%)",
  "hsl(270,50%,45%)",
  "hsl(20,70%,50%)",
];

const StatsSection = () => {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  if (!stats || stats.total === 0) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title mb-4">
            Statistiques <span className="gold-accent">dynamiques</span>
          </h2>
          <p className="text-muted-foreground">
            Les statistiques apparaîtront dès que des membres seront enregistrés.
          </p>
        </div>
      </section>
    );
  }

  const genderData = [
    { name: "Hommes", value: stats.hommes },
    { name: "Femmes", value: stats.femmes },
  ];

  const gradeData = GRADES.map((g) => ({
    name: g,
    count: stats.gradeCount[g],
  }));

  return (
    <section className="py-12 px-4 bg-muted/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="section-title text-center mb-8">
          Statistiques <span className="gold-accent">dynamiques</span>
        </h2>
        <p className="text-center text-muted-foreground mb-8 font-sans">
          {stats.total} membre{stats.total > 1 ? "s" : ""} enregistré{stats.total > 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gender pie chart */}
          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold font-serif text-center mb-4">
              Répartition Homme / Femme
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {genderData.map((_, index) => (
                    <Cell key={index} fill={GENDER_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Grade bar chart */}
          <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-lg font-semibold font-serif text-center mb-4">
              Membres par grade
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gradeData}>
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Membres" radius={[6, 6, 0, 0]}>
                  {gradeData.map((_, index) => (
                    <Cell key={index} fill={GRADE_CHART_COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
