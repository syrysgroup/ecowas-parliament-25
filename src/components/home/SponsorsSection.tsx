import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import naseniLogo from "@/assets/sponsors/naseni-logo.png";
import smedanLogo from "@/assets/sponsors/smedan-logo.png";
import providusLogo from "@/assets/sponsors/providus-logo.png";
import allianceLogo from "@/assets/sponsors/alliance-logo.png";

const partners = [
  {
    name: "AWALCO",
    description: "Association of West African Legislative Correspondents — strategic partner for ECOWAS Parliament Initiatives.",
  },
];

const implementingPartners = [
  { name: "Duchess NL" },
  { name: "Borderless Trade & Investment" },
  { name: "CMD Tourism & Trade Enterprises" },
];

const sponsors = [
  { name: "NASENI", logo: naseniLogo },
  { name: "SMEDAN", logo: smedanLogo },
  { name: "Providus Bank", logo: providusLogo },
  { name: "Alliance Economic Research and Ethics", logo: allianceLogo },
];

const SponsorsSection = () => {
  return (
    <>
      {/* Programme Context */}
      <section className="py-14 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              Current Initiative
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              25th Anniversary ECOWAS Parliament Programme
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              All 7 programme pillars — Youth Innovation, Trade & SME Forums, Women's Empowerment,
              Civic Education, Culture & Creativity, Parliamentary Awards, and Youth Parliament —
              fall under this flagship initiative.
            </p>
          </AnimatedSection>

          {/* Partners */}
          <AnimatedSection className="text-center mb-6">
            <Badge variant="outline" className="mb-3">Programme Partner</Badge>
          </AnimatedSection>
          <div className="flex justify-center mb-10">
            {partners.map((partner, i) => (
              <AnimatedSection key={partner.name} delay={i * 120}>
                <div className="p-8 rounded-2xl bg-card border-2 border-primary/20 shadow-lg max-w-md text-center hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                  <h3 className="font-black text-card-foreground text-2xl mb-3">{partner.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Implementing Partners */}
          <AnimatedSection className="text-center mb-4">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-3">
              Implementing Partners
            </Badge>
          </AnimatedSection>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {implementingPartners.map((p, i) => (
              <AnimatedSection key={p.name} delay={i * 100}>
                <div className="p-5 rounded-xl bg-card border border-border text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <span className="font-bold text-card-foreground text-sm">{p.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-14 bg-gradient-to-br from-primary/5 via-muted/40 to-secondary/5 border-t border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Sponsors & Supporters</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Organisations supporting ECOWAS Parliament Initiatives across West Africa.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsors.map((sponsor) => (
              <AnimatedSection key={sponsor.name}>
                <div className="group flex flex-col items-center gap-5 p-8 rounded-2xl border border-border bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-primary/30">
                  <div className="w-24 h-24 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300 p-2">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      loading="lazy"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-base font-bold text-card-foreground text-center leading-tight">{sponsor.name}</span>
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
