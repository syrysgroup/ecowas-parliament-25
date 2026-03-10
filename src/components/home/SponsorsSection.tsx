import AnimatedSection from "@/components/shared/AnimatedSection";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";
import africonnectLogo from "@/assets/sponsor-africonnect.png";
import waBankLogo from "@/assets/sponsor-wa-bank.png";
import sahelEnergyLogo from "@/assets/sponsor-sahel-energy.png";
import atlanticTelecomLogo from "@/assets/sponsor-atlantic-telecom.png";
import unityInsuranceLogo from "@/assets/sponsor-unity-insurance.png";
import coastalLogisticsLogo from "@/assets/sponsor-coastal-logistics.png";
import abujaHotelsLogo from "@/assets/sponsor-abuja-hotels.png";
import panAfricanMediaLogo from "@/assets/sponsor-pan-african-media.png";
import greenValleyLogo from "@/assets/sponsor-green-valley.png";
import accraDigitalLogo from "@/assets/sponsor-accra-digital.png";

const tiers = [
  {
    label: "Implementing Partners",
    description: "Strategic partners driving the 25th anniversary programme",
    logoClass: "h-16 md:h-20",
    containerClass: "gap-10 md:gap-16",
    sponsors: [
      { name: "Duchess NL", logo: duchessLogo },
      { name: "CMD Tourism & Trade Enterprises", logo: cmdLogo },
      { name: "Borderless Trade & Investment", logo: borderlessLogo },
    ],
  },
  {
    label: "Platinum Sponsors",
    description: "Premium programme supporters",
    logoClass: "h-12 md:h-16",
    containerClass: "gap-8 md:gap-14",
    sponsors: [
      { name: "West Africa Bank", logo: waBankLogo },
      { name: "Sahel Energy Group", logo: sahelEnergyLogo },
      { name: "AfriConnect Solutions", logo: africonnectLogo },
    ],
  },
  {
    label: "Gold Sponsors",
    description: "Major programme contributors",
    logoClass: "h-10 md:h-14",
    containerClass: "gap-8 md:gap-12",
    sponsors: [
      { name: "Atlantic Telecom", logo: atlanticTelecomLogo },
      { name: "Unity Insurance", logo: unityInsuranceLogo },
      { name: "Coastal Logistics", logo: coastalLogisticsLogo },
      { name: "Abuja Hotels Group", logo: abujaHotelsLogo },
    ],
  },
  {
    label: "Sponsors",
    description: "Programme supporters",
    logoClass: "h-8 md:h-12",
    containerClass: "gap-6 md:gap-10",
    sponsors: [
      { name: "Pan-African Media Network", logo: panAfricanMediaLogo },
      { name: "Green Valley Agro", logo: greenValleyLogo },
      { name: "Accra Digital Hub", logo: accraDigitalLogo },
    ],
  },
];

const SponsorsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Our <span className="text-primary">Partners & Sponsors</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Organizations supporting the ECOWAS Parliament 25th anniversary programme.
          </p>
        </AnimatedSection>

        <div className="space-y-12">
          {tiers.map((tier, tierIndex) => (
            <AnimatedSection key={tier.label} delay={tierIndex * 100}>
              <div className={`rounded-2xl border border-border bg-card p-8 ${tierIndex === 0 ? "shadow-lg ring-1 ring-primary/10" : "shadow-sm"}`}>
                <div className="text-center mb-6">
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                    tierIndex === 0 ? "bg-primary text-primary-foreground" :
                    tierIndex === 1 ? "bg-accent text-accent-foreground" :
                    tierIndex === 2 ? "bg-secondary text-secondary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {tier.label}
                  </span>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <div className={`flex flex-wrap items-center justify-center ${tier.containerClass}`}>
                  {tier.sponsors.map((sponsor) => (
                    <div key={sponsor.name} className="flex flex-col items-center gap-2 group">
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className={`${tier.logoClass} w-auto grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300`}
                      />
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{sponsor.name}</span>
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
