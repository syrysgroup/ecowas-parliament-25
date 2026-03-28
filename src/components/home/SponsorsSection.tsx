import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import { Badge } from "@/components/ui/badge";

const partners = [
  {
    name: "AWALCO",
    description: "Association of West African Living Councils — strategic co-organising partner for governance programmes.",
  },
];

const sponsors = [
  { name: "NASENI", color: "#006838" },
  { name: "SMEDAN", color: "#1a3a5c" },
  { name: "Providus Bank", color: "#e6550d" },
  { name: "Alliance Economic Research and Ethics", color: "#2c5aa0" },
];

const SponsorsSection = () => {
  return (
    <>
      {/* Partners */}
      <section className="py-14 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              Programme Partners
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Implementing Partners
            </h2>
          </AnimatedSection>

          <div className="flex justify-center">
            {partners.map((partner, i) => (
              <AnimatedSection key={partner.name} delay={i * 120}>
                <div className="p-6 rounded-xl bg-card border-2 border-primary/20 shadow-md max-w-md text-center">
                  <h3 className="font-bold text-card-foreground text-xl mb-2">{partner.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-14 bg-muted/40 border-t border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Sponsors & Supporters</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Organisations supporting ECOWAS Parliament Initiatives across West Africa.
            </p>
          </AnimatedSection>

          <div className="flex flex-wrap justify-center gap-4">
            {sponsors.map((sponsor) => (
              <AnimatedSection key={sponsor.name}>
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-card hover:shadow-md transition-all">
                  <SponsorLogo name={sponsor.name} color={sponsor.color} size={40} />
                  <span className="text-sm font-medium text-card-foreground">{sponsor.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default SponsorsSection;
