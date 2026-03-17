import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";
import { Badge } from "@/components/ui/badge";

const implementingPartners = [
  {
    name: "Duchess NL",
    lead: "Dr. Victoria Akai IIPM",
    role: "CEO",
    logo: duchessLogo,
    description: "Leading implementing partner coordinating the year-long programme.",
  },
  {
    name: "Borderless Trade & Investment",
    lead: "Dr. Olori Boye-Ajayi",
    role: "Managing Partner",
    logo: borderlessLogo,
    description: "Expertise in trade facilitation and regional economic integration.",
  },
  {
    name: "CMD Tourism & Trade Enterprises",
    lead: "Blessing Okpale",
    role: "Lead",
    logo: cmdLogo,
    description: "Tourism and trade enterprise development across West Africa.",
  },
];

const sponsors = {
  platinum: [
    { name: "West African Development Bank", color: "#1a6b8a" },
    { name: "ECOWAS Commission", color: "#008244" },
  ],
  gold: [
    { name: "African Union", color: "#b8860b" },
    { name: "United Nations Development Programme", color: "#0072bc" },
    { name: "GIZ West Africa", color: "#c4161c" },
  ],
  sponsors: [
    { name: "Access Bank Group", color: "#e6550d" },
    { name: "Dangote Foundation", color: "#1a3a5c" },
    { name: "MTN Group Foundation", color: "#ffcb05" },
    { name: "Afreximbank", color: "#00305e" },
  ],
};

const tierConfig = {
  platinum: { label: "Platinum", border: "border-ecowas-yellow/40", bg: "bg-accent/5" },
  gold: { label: "Gold", border: "border-ecowas-yellow/20", bg: "bg-accent/3" },
  sponsors: { label: "Sponsors", border: "border-border", bg: "bg-muted/30" },
};

const SponsorsSection = () => {
  return (
    <>
      {/* Implementing Partners — premium co-organiser treatment */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              Programme Co-Organisers
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Implementing Partners
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Strategic co-owners driving the 25th anniversary programme across West Africa.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {implementingPartners.map((partner, i) => (
              <AnimatedSection key={partner.name} delay={i * 120}>
                <div className="relative p-6 rounded-xl bg-card border-2 border-primary/20 shadow-md hover:shadow-xl transition-all group">
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      Co-Organiser
                    </Badge>
                  </div>
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-14 w-auto mb-4 group-hover:scale-105 transition-transform"
                  />
                  <h3 className="font-bold text-card-foreground text-lg">{partner.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">
                    {partner.lead} — {partner.role}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors — tiered layout */}
      <section className="py-16 bg-muted/40 border-t border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Sponsors & Supporters</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Organisations supporting the year-long commemorative programme.
            </p>
          </AnimatedSection>

          {(Object.keys(sponsors) as Array<keyof typeof sponsors>).map((tier) => {
            const config = tierConfig[tier];
            return (
              <AnimatedSection key={tier} className="mb-10 last:mb-0">
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">
                  {config.label}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {sponsors[tier].map((sponsor) => (
                    <div
                      key={sponsor.name}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${config.border} ${config.bg} bg-card hover:shadow-md transition-all`}
                    >
                      <SponsorLogo name={sponsor.name} color={sponsor.color} size={40} />
                      <span className="text-sm font-medium text-card-foreground">{sponsor.name}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default SponsorsSection;
