import AnimatedSection from "@/components/shared/AnimatedSection";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";
import waBankLogo from "@/assets/sponsor-wa-bank.png";
import sahelEnergyLogo from "@/assets/sponsor-sahel-energy.png";
import africonnectLogo from "@/assets/sponsor-africonnect.png";
import atlanticTelecomLogo from "@/assets/sponsor-atlantic-telecom.png";
import unityInsuranceLogo from "@/assets/sponsor-unity-insurance.png";
import coastalLogisticsLogo from "@/assets/sponsor-coastal-logistics.png";
import abujaHotelsLogo from "@/assets/sponsor-abuja-hotels.png";
import panAfricanMediaLogo from "@/assets/sponsor-pan-african-media.png";
import greenValleyLogo from "@/assets/sponsor-green-valley.png";
import accraDigitalLogo from "@/assets/sponsor-accra-digital.png";

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
    sponsors: [
      { name: "West Africa Bank", logo: waBankLogo },
      { name: "Sahel Energy Group", logo: sahelEnergyLogo },
      { name: "AfriConnect Solutions", logo: africonnectLogo },
    ],
  },
  {
    label: "Gold Sponsors",
    badgeClass: "bg-secondary text-secondary-foreground",
    sponsors: [
      { name: "Atlantic Telecom", logo: atlanticTelecomLogo },
      { name: "Unity Insurance", logo: unityInsuranceLogo },
      { name: "Coastal Logistics", logo: coastalLogisticsLogo },
      { name: "Abuja Hotels Group", logo: abujaHotelsLogo },
    ],
  },
  {
    label: "Sponsors",
    badgeClass: "bg-muted text-muted-foreground",
    sponsors: [
      { name: "Pan-African Media", logo: panAfricanMediaLogo },
      { name: "Green Valley Agro", logo: greenValleyLogo },
      { name: "Accra Digital Hub", logo: accraDigitalLogo },
    ],
  },
];

const SponsorsSection = () => {
  return (
    <section className="py-20">
      <div className="container">
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
                <img src={partner.logo} alt={partner.name} className="h-14 w-auto mb-4" loading="lazy" />
                <h3 className="font-bold text-card-foreground text-lg">{partner.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">
                  {partner.lead} — {partner.role}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground">
            Official <span className="text-primary">Sponsors</span>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                  {tier.sponsors.map((sponsor) => (
                    <div key={sponsor.name} className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-col items-center justify-center text-center min-h-36 hover:bg-muted/40 transition-colors">
                      <img src={sponsor.logo} alt={sponsor.name} className="max-h-14 w-auto object-contain" loading="lazy" />
                      <span className="mt-3 text-xs font-medium text-muted-foreground">{sponsor.name}</span>
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
