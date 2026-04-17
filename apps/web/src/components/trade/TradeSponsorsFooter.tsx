import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";

const tiers = [
  {
    label: "Programme Partners",
    sponsors: [
      { name: "Providus Bank", color: "hsl(340, 66%, 34%)" },
      { name: "Global African Business Assoc.", color: "hsl(50, 87%, 45%)" },
      { name: "VALCERTRA", color: "hsl(152, 100%, 26%)" },
      { name: "SMEDAN", color: "hsl(190, 35%, 53%)" },
    ],
  },
  {
    label: "Institutional Partners",
    sponsors: [
      { name: "Awalco", color: "hsl(190, 35%, 53%)" },
      { name: "African Development Bank", color: "hsl(340, 66%, 34%)" },
      { name: "ECOWAS Commission", color: "hsl(152, 100%, 26%)" },
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
