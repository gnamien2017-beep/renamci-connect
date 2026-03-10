import { Award, Heart, Building } from "lucide-react";

const pillars = [
  {
    icon: Award,
    title: "Excellence",
    description: "Promouvoir les standards les plus élevés dans l'administration publique et le service à la nation.",
  },
  {
    icon: Heart,
    title: "Fraternité",
    description: "Cultiver des liens solides entre énarques musulmans, dans un esprit d'entraide et de solidarité.",
  },
  {
    icon: Building,
    title: "Service public",
    description: "S'engager pour une gouvernance exemplaire et contribuer au développement de la Côte d'Ivoire.",
  },
];

const AboutSection = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="section-title mb-4">
          Notre <span className="gold-accent">Organisation</span>
        </h2>
        <p className="text-muted-foreground font-sans max-w-3xl mx-auto mb-12 leading-relaxed">
          Le Réseau des Énarques Musulmans de Côte d'Ivoire (RENAMCI) est une organisation
          professionnelle regroupant les diplômés de l'ENA de confession musulmane, œuvrant
          pour l'excellence, la fraternité et le service public.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className="glass-card rounded-xl p-8 flex flex-col items-center gap-4 animate-fade-in hover:shadow-lg transition-shadow duration-300"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <pillar.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">{pillar.title}</h3>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
