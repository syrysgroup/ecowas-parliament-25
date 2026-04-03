import AnimatedSection from "@/components/shared/AnimatedSection";
import { Crown, Globe, Sparkles } from "lucide-react";

const partners = [
  {
    name: "Duchess NL",
    lead: "Dr. Victoria Akai IIPM",
    role: "CEO",
    description: "Leading implementing partner coordinating the programme direction and executive partnerships.",
    icon: Crown,
    accent: "bg-primary/10 text-primary",
  },
  {
    name: "Borderless Trade & Investment",
    lead: "Dr. Olori Boye-Ajayi",
    role: "Managing Partner",
    description: "Driving trade diplomacy, regional engagement, and private-sector mobilisation.",
    icon: Globe,
    accent: "bg-ecowas-blue/10 text-ecowas-blue",
  },
  {
    name: "CMD Tourism & Trade Enterprises",
    lead: "Blessing Okpale",
    role: "Lead",
    description: "Supporting programming, event experience, and community-facing delivery.",
    icon: Sparkles,
    accent: "bg-secondary/10 text-secondary",
  },
];

const ImplementingPartnersSection = () => {
  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            Programme Co-Organisers
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Implementing <span className="text-primary">Partners</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            The organisations driving the 25th Anniversary programmes across West Africa
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {partners.map((partner, i) => {
            const Icon = partner.icon;
            return (
              <AnimatedSection key={partner.name} delay={i * 100}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-lg group h-full">
                  <div className="flex flex-col items-start gap-4">
                    <div className={`p-3 rounded-xl ${partner.accent} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-card-foreground">{partner.name}</h3>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 mb-2">
                        {partner.role}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {partner.description}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Lead:</span>
                        <span className="text-xs font-semibold text-foreground/80">{partner.lead}</span>
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
