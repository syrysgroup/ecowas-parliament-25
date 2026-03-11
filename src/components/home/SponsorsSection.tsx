import AnimatedSection from "@/components/shared/AnimatedSection";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";
import SponsorLogo from "@/components/shared/SponsorLogo";

const implementingPartners = [
  {
    name: "Duchess NL",
    logo: duchessLogo,
    lead: "Dr. Victoria Akai IIPM",
    role: "CEO",
    description: "Leading co-organiser coordinating the year-long commemorative programme.",
  },
  {
    name: "Borderless Trade & Investment",
    logo: borderlessLogo,
    lead: "Dr. Olori Boye-Ajayi",
    role: "Managing Partner",
    description: "Expertise in trade facilitation and regional economic integration across ECOWAS.",
  },
  {
    name: "CMD Tourism & Trade",
    logo: cmdLogo,
    lead: "Blessing Okpale",
    role: "Lead",
    description: "Tourism and trade enterprise development across West Africa.",
  },
];

const sponsorTiers = [
  {
    label: "Platinum Sponsors",
    badgeClass: "bg-accent text-accent-foreground",
    logoSize: 72,
    sponsors: [
      { name: "West Africa Bank", color: "hsl(220, 65%, 45%)", secondary: "hsl(45, 80%, 50%)" },
      { name: "Sahel Energy Group", color: "hsl(35, 80%, 50%)", secondary: "hsl(15, 70%, 45%)" },
      { name: "AfriConnect Solutions", color: "hsl(152, 55%, 40%)", secondary: "hsl(190, 60%, 45%)" },
    ],
  },
  {
    label: "Gold Sponsors",
    badgeClass: "bg-secondary text-secondary-foreground",
    logoSize: 64,
    sponsors: [
      { name: "Atlantic Telecom", color: "hsl(200, 65%, 45%)", secondary: "hsl(210, 55%, 55%)" },
      { name: "Unity Insurance", color: "hsl(340, 60%, 45%)", secondary: "hsl(350, 50%, 55%)" },
      { name: "Coastal Logistics", color: "hsl(190, 50%, 40%)", secondary: "hsl(170, 45%, 50%)" },
      { name: "Abuja Hotels Group", color: "hsl(25, 70%, 45%)", secondary: "hsl(40, 75%, 50%)" },
    ],
  },
  {
    label: "Sponsors",
    badgeClass: "bg-muted text-muted-foreground",
    logoSize: 56,
    sponsors: [
      { name: "Pan-African Media", color: "hsl(260, 50%, 45%)", secondary: "hsl(280, 45%, 55%)" },
      { name: "Green Valley Agro", color: "hsl(120, 45%, 40%)", secondary: "hsl(90, 50%, 45%)" },
      { name: "Accra Digital Hub", color: "hsl(175, 55%, 40%)", secondary: "hsl(200, 50%, 50%)" },
    ],
  },
];

const SponsorsSection = () => {
  return (
    <section className="py-20">
      <div className="container">
        {/* Implementing Partners — Co-Organisers */}
        <AnimatedSection className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Programme <span className="text-primary">Co-Organisers</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Strategic implementing partners co-driving the 25th anniversary programme.
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {implementingPartners.map((partner) => (
              <div
                key={partner.name}
                className="relative rounded-2xl border-2 border-primary/20 bg-card p-6 hover:shadow-xl hover:border-primary/40 transition-all group"
              >
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                    Co-Organiser
                  </span>
                </div>
                <img src={partner.logo} alt={partner.name} className="h-14 w-auto mb-4" />
                <h3 className="font-bold text-card-foreground text-lg">{partner.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">
                  {partner.lead} — {partner.role}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Sponsors */}
        <AnimatedSection className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground">
            Our <span className="text-accent-foreground">Sponsors</span>
          </h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Organizations supporting the ECOWAS Parliament 25th anniversary programme.
          </p>
        </AnimatedSection>

        <div className="space-y-8">
          {sponsorTiers.map((tier, ti) => (
            <AnimatedSection key={tier.label} delay={ti * 100}>
              <div className={`rounded-2xl border border-border bg-card p-6 ${ti === 0 ? "shadow-md ring-1 ring-accent/20" : "shadow-sm"}`}>
                <div className="text-center mb-5">
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tier.badgeClass}`}>
                    {tier.label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                  {tier.sponsors.map((sponsor) => (
                    <div key={sponsor.name} className="flex flex-col items-center gap-1 group/s">
                      <SponsorLogo
                        name={sponsor.name}
                        color={sponsor.color}
                        secondaryColor={sponsor.secondary}
                        size={tier.logoSize}
                        className="opacity-80 group-hover/s:opacity-100 transition-opacity"
                      />
                      <span className="text-xs text-muted-foreground opacity-0 group-hover/s:opacity-100 transition-opacity">
                        {sponsor.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
