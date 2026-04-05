import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorPlaceholderLogo from "@/components/shared/SponsorPlaceholderLogo";

interface Sponsor {
  name: string;
}

interface TierGroup {
  label: string;
  sponsors: Sponsor[];
}

interface ProgrammeSponsorsFooterProps {
  tiers: TierGroup[];
  title?: string;
}

const ProgrammeSponsorsFooter = ({ tiers, title = "Programme Sponsors & Partners" }: ProgrammeSponsorsFooterProps) => (
  <section className="py-16 bg-muted/30">
    <div className="container">
      <AnimatedSection className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">ECOWAS Parliament Initiative Sponsors</p>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </AnimatedSection>
      {tiers.map((tier, ti) => (
        <AnimatedSection key={ti} delay={ti * 100} className="mb-10 last:mb-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-5">{tier.label}</p>
          <div className="flex flex-wrap justify-center gap-8">
            {tier.sponsors.map((s, si) => (
              <SponsorPlaceholderLogo key={si} name={s.name} size={96} />
            ))}
          </div>
        </AnimatedSection>
      ))}
    </div>
  </section>
);

export default ProgrammeSponsorsFooter;
