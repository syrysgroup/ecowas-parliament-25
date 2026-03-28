import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import { Badge } from "@/components/ui/badge";

const partners = [
  {
    name: "AWALCO",
    description: "Association of West African Living Councils — strategic partner for ECOWAS Parliament Initiatives.",
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
              Partners
            </h2>
          </AnimatedSection>

          <div className="flex justify-center">
            {partners.map((partner, i) => (
              <AnimatedSection key={partner.name} delay={i * 120}>
                <div className="p-8 rounded-2xl bg-card border-2 border-primary/20 shadow-lg max-w-md text-center hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                  <h3 className="font-black text-card-foreground text-2xl mb-3">{partner.name}</h3>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sponsors.map((sponsor) => (
              <AnimatedSection key={sponsor.name}>
                <div className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  style={{ borderLeftWidth: 4, borderLeftColor: sponsor.color }}>
                  <SponsorLogo name={sponsor.name} color={sponsor.color} size={64} />
                  <span className="text-base font-bold text-card-foreground text-center">{sponsor.name}</span>
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
