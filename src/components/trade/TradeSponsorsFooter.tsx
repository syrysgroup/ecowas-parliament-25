import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";

const tiers = [
  {
    label: "Strategic Partners",
    sponsors: [
      { name: "African Development Bank", color: "hsl(152, 100%, 26%)" },
      { name: "Afreximbank", color: "hsl(190, 35%, 53%)" },
      { name: "ECOWAS Commission", color: "hsl(50, 87%, 45%)" },
    ],
  },
  {
    label: "Programme Partners",
    sponsors: [
      { name: "AfCFTA Secretariat", color: "hsl(340, 66%, 34%)" },
      { name: "ITC Geneva", color: "hsl(50, 87%, 45%)" },
      { name: "Providus Bank", color: "hsl(152, 100%, 26%)" },
      { name: "UNCTAD", color: "hsl(190, 35%, 53%)" },
    ],
  },
  {
    label: "Supporting Institutions",
    sponsors: [
      { name: "World Bank", color: "hsl(190, 35%, 53%)" },
      { name: "AU Commission", color: "hsl(340, 66%, 34%)" },
      { name: "ECOWAS Parliament", color: "hsl(152, 100%, 26%)" },
    ],
  },
];

const TradeSponsorsFooter = () => (
  <section className="py-16 bg-muted/30">
    <div className="container">
      <AnimatedSection className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Our Partners</p>
        <h2 className="text-2xl font-bold text-foreground">Programme Sponsors & Partners</h2>
      </AnimatedSection>
      {tiers.map((tier, ti) => (
        <AnimatedSection key={ti} delay={ti * 100} className="mb-10 last:mb-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-5">{tier.label}</p>
          <div className="flex flex-wrap justify-center gap-8">
            {tier.sponsors.map((s, si) => (
              <div key={si} className="flex flex-col items-center gap-2 group">
                <div className="p-3 rounded-xl bg-card border border-border group-hover:shadow-md transition-shadow duration-300">
                  <SponsorLogo name={s.name} color={s.color} size={56} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center max-w-[80px] leading-tight">{s.name}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      ))}
    </div>
  </section>
);

export default TradeSponsorsFooter;
