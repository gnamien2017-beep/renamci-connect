import { useQuery } from "@tanstack/react-query";
import { fetchStats, GRADES } from "@/lib/supabase-helpers";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Users, UserCheck, UserX, BarChart3 } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const GENDER_COLORS = ["hsl(145, 63%, 26%)", "hsl(43, 75%, 50%)"];
const GRADE_CHART_COLORS = [
  "hsl(145,63%,26%)", "hsl(200,70%,45%)", "hsl(43,75%,50%)",
  "hsl(340,65%,47%)", "hsl(270,50%,45%)", "hsl(20,70%,50%)",
];

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <div className="glass-card rounded-xl p-5 flex items-center gap-4 animate-fade-in">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-primary-foreground" />
    </div>
    <div className="text-left">
      <p className="font-serif text-2xl font-bold text-foreground">
        <AnimatedCounter target={value} />
      </p>
      <p className="text-muted-foreground text-xs font-sans">{label}</p>
    </div>
  </div>
);

const StatsSection = () => {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: fetchStats });

  if (!stats || stats.total === 0) {
    return (
      <section className="py-12 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title mb-4">Notre réseau <span className="gold-accent">en chiffres</span></h2>
          <p className="text-muted-foreground">Les statistiques apparaîtront dès que des membres seront enregistrés.</p>
        </div>
      </section>
    );
  }

  const genderData = [
    { name: "Hommes", value: stats.hommes },
    { name: "Femmes", value: stats.femmes },
  ];
  const gradeData = GRADES.map((g) => ({ name: g, count: stats.gradeCount[g] }));

  return (
    <section className="py-16 px-4 bg-primary/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="section-title text-center mb-4">
          Notre réseau <span className="gold-accent">en chiffres</span>
        </h2>
        <p className="text-center text-muted-foreground mb-10 font-sans">
          Découvrez la force de notre communauté
        </p>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Total membres" value={stats.total} color="bg-primary" />
          <StatCard icon={UserCheck} label="Hommes" value={stats.hommes} color="bg-primary" />
          <StatCard icon={UserX} label="Femmes" value={stats.femmes} color="bg-[hsl(43,75%,50%)]" />
          <StatCard icon={BarChart3} label="Grades" value={GRADES.length} color="bg-accent" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold font-serif text-center mb-4">Répartition Homme / Femme</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-lg font-semibold font-serif text-center mb-4">Membres par grade</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gradeData}>
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Membres" radius={[6, 6, 0, 0]}>
                  {gradeData.map((_, i) => <Cell key={i} fill={GRADE_CHART_COLORS[i]} />)}
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
