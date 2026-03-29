import { Link } from "react-router-dom";
import { Lightbulb, TrendingUp, Heart, Megaphone, Palette, Building2, Award } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";

const pillars = [
  {
    title: "Youth Innovation & Smart Challenge",
    description: "National competitions igniting ideas and ambition, converging in Accra for a regional finale.",
    icon: Lightbulb,
    to: "/programmes/youth",
    gradient: "from-[hsl(var(--ecowas-yellow))] to-[hsl(50_87%_55%)]",
    iconBg: "bg-ecowas-yellow/10 text-ecowas-yellow",
  },
  {
    title: "Trade & SME Forums",
    description: "B2B forums, pilot trade corridors, and dialogue with policymakers across the region.",
    icon: TrendingUp,
    to: "/programmes/trade",
    gradient: "from-[hsl(var(--primary))] to-[hsl(var(--ecowas-lime))]",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    title: "Women's Economic Empowerment",
    description: "Women-focused trade and entrepreneurship platforms driving inclusive growth.",
    icon: Heart,
    to: "/programmes/women",
    gradient: "from-[hsl(var(--secondary))] to-[hsl(340_66%_50%)]",
    iconBg: "bg-secondary/10 text-secondary",
  },
  {
    title: "Civic Education & Awareness",
    description: "The ECOWAS Caravan and TV Game Show bringing Parliament closer to citizens.",
    icon: Megaphone,
    to: "/programmes/civic",
    gradient: "from-[hsl(var(--ecowas-blue))] to-[hsl(190_35%_65%)]",
    iconBg: "bg-ecowas-blue/10 text-ecowas-blue",
  },
  {
    title: "Culture & Creative Celebrations",
    description: "Fashion, film, food, literature, music, art, and sport celebrating West African diversity.",
    icon: Palette,
    to: "/programmes/culture",
    gradient: "from-[hsl(var(--ecowas-lime))] to-[hsl(73_53%_60%)]",
    iconBg: "bg-ecowas-lime/10 text-ecowas-lime",
  },
  {
    title: "Parliamentary Awards",
    description: "Honouring legislative excellence, leadership, and service across ECOWAS Member States.",
    icon: Award,
    to: "/programmes/awards",
    gradient: "from-[hsl(var(--accent))] to-[hsl(var(--ecowas-yellow))]",
    iconBg: "bg-accent/10 text-accent",
  },
  {
    title: "Simulated Youth Parliament",
    description: "Giving young people a seat at the table — launching the ECOWAS Youth Parliament vision.",
    icon: Building2,
    to: "/programmes/parliament",
    gradient: "from-[hsl(var(--ecowas-red))] to-[hsl(340_66%_50%)]",
    iconBg: "bg-ecowas-red/10 text-ecowas-red",
  },
];

const PillarsGrid = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <AnimatedSection className="text-center mb-14">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            25th Anniversary ECOWAS Parliament Programme
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Programme <span className="text-primary">Pillars</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Seven strategic pillars under the 25th Anniversary initiative — spanning youth innovation, trade,
            women's empowerment, civic engagement, culture, parliamentary awards, and parliamentary simulation.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <AnimatedSection key={pillar.to} delay={i * 100}>
              <Link
                to={pillar.to}
                className="group relative block p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                {/* Gradient top border on hover */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative">
                  <div className={`inline-flex p-3 rounded-lg ${pillar.iconBg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <pillar.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsGrid;
