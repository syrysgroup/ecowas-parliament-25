import AnimatedSection from "@/components/shared/AnimatedSection";
import { Users, Building2, Globe, Award } from "lucide-react";

const partners = [
  {
    name: "ECOWAS Commission",
    role: "Presenting Partner",
    description: "The executive arm of ECOWAS, providing institutional support and coordination across all 12 member states.",
    programme: "All Programmes",
    icon: Building2,
    accent: "bg-primary/10 text-primary",
  },
  {
    name: "West Africa Trade Hub",
    role: "Implementation Partner",
    description: "Supporting the Trade & Investment Forum and connecting West African businesses with international markets.",
    programme: "Trade & Investment",
    icon: Globe,
    accent: "bg-ecowas-blue/10 text-ecowas-blue",
  },
  {
    name: "AWALCO",
    role: "Implementation Partner",
    description: "The African Women Achievers & Leaders Consortium, driving the Women's Leadership Summit programming.",
    programme: "Women's Leadership",
    icon: Users,
    accent: "bg-ecowas-magenta/10 text-ecowas-magenta",
  },
  {
    name: "West African Youth Network",
    role: "Implementation Partner",
    description: "Coordinating the Youth Innovation Challenge and empowering the next generation of West African leaders.",
    programme: "Youth Innovation",
    icon: Award,
    accent: "bg-accent/10 text-accent",
  },
];

const ImplementingPartnersSection = () => {
  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            Key Figures & Organisations
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Implementing <span className="text-primary">Partners</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            The organisations and leaders driving the 25th Anniversary programmes across West Africa
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {partners.map((partner, i) => {
            const Icon = partner.icon;
            return (
              <AnimatedSection key={partner.name} delay={i * 100}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-lg group h-full">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${partner.accent} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-card-foreground">{partner.name}</h3>
                      </div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                        {partner.role}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {partner.description}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Programme:</span>
                        <span className="text-xs font-semibold text-foreground/80">{partner.programme}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ImplementingPartnersSection;
