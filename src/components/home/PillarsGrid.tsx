import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const pillars = [
  {
    title: "Youth Innovation & Entrepreneurship",
    description: "Empowering the next generation of West African innovators across all 12 ECOWAS member states through competitions, mentorship, and funding access.",
    emoji: "🚀",
    to: "/programmes/youth",
    color: "hsl(190 35% 53%)",
    iconBg: "bg-ecowas-blue/10",
    progress: 52,
    lead: "K. Asante",
    sponsors: ["AfDB", "UNDP"],
  },
  {
    title: "Trade & SME Forums",
    description: "Strengthening intra-regional trade and supporting Small & Medium Enterprises across West Africa to connect, grow, and access regional markets.",
    emoji: "🤝",
    to: "/programmes/trade",
    color: "hsl(152 100% 26%)",
    iconBg: "bg-primary/10",
    progress: 41,
    lead: "C. Nwosu",
    sponsors: ["AfDB", "Duchess", "WATH"],
  },
  {
    title: "Women's Empowerment Forum",
    description: "Advancing gender equality, women's political leadership, and economic empowerment across West African parliamentary institutions and civil society.",
    emoji: "⚡",
    to: "/programmes/women",
    color: "hsl(340 66% 34%)",
    iconBg: "bg-secondary/10",
    progress: 35,
    lead: "F. Diallo",
    sponsors: ["UNDP"],
  },
  {
    title: "Civic Education & Democracy",
    description: "Promoting democratic values, constitutional literacy, and active civic participation across the 12 ECOWAS member states through outreach and education.",
    emoji: "🏛️",
    to: "/programmes/civic",
    color: "hsl(210 50% 30%)",
    iconBg: "bg-ecowas-blue/10",
    progress: 28,
    lead: "TBD",
    sponsors: ["EU Delegation"],
  },
  {
    title: "Culture & Creativity",
    description: "Celebrating the rich cultural heritage, arts, and creative industries of West Africa — elevating regional identity on the international stage.",
    emoji: "🎨",
    to: "/programmes/culture",
    color: "hsl(25 85% 55%)",
    iconBg: "bg-accent/10",
    progress: 22,
    lead: "TBD",
    sponsors: [],
  },
  {
    title: "AWALCO Parliamentary Awards",
    description: "Recognising outstanding contributions to regional parliamentary democracy across 3 award categories — honouring individuals and institutions.",
    emoji: "🏆",
    to: "/programmes/awards",
    color: "hsl(50 87% 45%)",
    iconBg: "bg-accent/10",
    progress: 60,
    lead: "S. Adesanya",
    sponsors: ["AfDB"],
  },
  {
    title: "Youth Parliament Simulation",
    description: "A model parliamentary session giving young West Africans hands-on governance experience — delegate applications open for all 12 member states.",
    emoji: "🌍",
    to: "/programmes/parliament",
    color: "hsl(73 53% 49%)",
    iconBg: "bg-ecowas-lime/10",
    progress: 45,
    lead: "K. Asante",
    sponsors: ["EU Delegation"],
  },
];

const PillarsGrid = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              EP25 Programme Pillars
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
              7 Programmes.<br />One Anniversary.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl leading-relaxed">
              Each programme has its own leads, sponsors, and objectives. Hover a card to see
              that programme's specific partners.
            </p>
          </AnimatedSection>
          <Link to="/about" className="text-sm text-primary font-bold hover:gap-2.5 inline-flex items-center gap-1.5 transition-all">
            All programmes →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {pillars.map((pillar, i) => (
            <AnimatedSection key={pillar.to} delay={i * 80}>
              <Link
                to={pillar.to}
                className="group relative block p-5 rounded-2xl border border-border bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Colored top bar on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  style={{ background: pillar.color }}
                />

                {/* Icon */}
                <div className={`w-11 h-11 rounded-lg ${pillar.iconBg} flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  {pillar.emoji}
                </div>

                <h3 className="text-base font-bold text-card-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3.5">
                  {pillar.description}
                </p>

                {/* Progress footer */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-muted-foreground">{pillar.progress}%</span>
                  <div className="flex-1">
                    <Progress value={pillar.progress} className="h-[3px]" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{pillar.lead}</span>
                </div>

                {/* Hover-reveal sponsors */}
                <div className="max-h-0 overflow-hidden group-hover:max-h-16 group-hover:border-t group-hover:border-border group-hover:mt-3.5 group-hover:pt-3 transition-all duration-300">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Sponsors
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {pillar.sponsors.length > 0 ? (
                      pillar.sponsors.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-semibold">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground font-semibold italic opacity-50">
                        Open
                      </span>
                    )}
                  </div>
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
