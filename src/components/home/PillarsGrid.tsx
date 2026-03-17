import { Link } from "react-router-dom";
import { Lightbulb, TrendingUp, Heart, Megaphone, Palette, Building2, Award } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";

const pillars = [
  {
    title: "Youth Innovation & Smart Challenge",
    description: "National competitions igniting ideas and ambition, converging in Accra for a regional finale.",
    icon: Lightbulb,
    to: "/programmes/youth",
    color: "bg-ecowas-yellow/10 text-ecowas-yellow",
    border: "hover:border-ecowas-yellow/40",
  },
  {
    title: "Trade & SME Forums",
    description: "B2B forums, pilot trade corridors, and dialogue with policymakers across the region.",
    icon: TrendingUp,
    to: "/programmes/trade",
    color: "bg-primary/10 text-primary",
    border: "hover:border-primary/40",
  },
  {
    title: "Women's Economic Empowerment",
    description: "Women-focused trade and entrepreneurship platforms driving inclusive growth.",
    icon: Heart,
    to: "/programmes/women",
    color: "bg-secondary/10 text-secondary",
    border: "hover:border-secondary/40",
  },
  {
    title: "Civic Education & Awareness",
    description: "The ECOWAS Caravan and TV Game Show bringing Parliament closer to citizens.",
    icon: Megaphone,
    to: "/programmes/civic",
    color: "bg-ecowas-blue/10 text-ecowas-blue",
    border: "hover:border-ecowas-blue/40",
  },
  {
    title: "Culture & Creative Celebrations",
    description: "Fashion, film, food, literature, music, art, and sport celebrating West African diversity.",
    icon: Palette,
    to: "/programmes/culture",
    color: "bg-ecowas-lime/10 text-ecowas-lime",
    border: "hover:border-ecowas-lime/40",
  },
  {
    title: "Simulated Youth Parliament",
    description: "Giving young people a seat at the table — launching the ECOWAS Youth Parliament vision.",
    icon: Building2,
    to: "/programmes/parliament",
    color: "bg-ecowas-red/10 text-ecowas-red",
    border: "hover:border-ecowas-red/40",
  },
];

const PillarsGrid = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Programme <span className="text-primary">Pillars</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Six strategic pillars spanning youth innovation, trade, women's empowerment,
            civic engagement, culture, and parliamentary simulation.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <AnimatedSection key={pillar.to} delay={i * 100}>
              <Link
                to={pillar.to}
                className={`group block p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${pillar.border}`}
              >
                <div className={`inline-flex p-3 rounded-lg ${pillar.color} mb-4`}>
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsGrid;
