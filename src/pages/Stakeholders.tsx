import Layout from "@/components/layout/Layout";
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

const leadership = [
  { name: "Rt. Hon. Hadja Mémounatou Ibrahima", title: "Speaker of the ECOWAS Parliament", image: "/announcement/1.jpg" },
  { name: "Mrs. Uche Duru", title: "Chief Communication Officer, ECOWAS Parliament", image: "/announcement/15.jpg" },
  { name: "Dr. Kabeer Garba", title: "Ag. Director, Department of Parliamentary Affairs", image: "/announcement/13.jpg" },
];

const implementingPartners = [
  { name: "Duchess NL", lead: "Dr. Victoria Akai IIPM", role: "CEO", logo: duchessLogo, description: "Leading co-organiser coordinating the year-long programme." },
  { name: "Borderless Trade & Investment", lead: "Dr. Olori Boye-Ajayi", role: "Managing Partner", logo: borderlessLogo, description: "Expertise in trade facilitation and regional economic integration." },
  { name: "CMD Tourism & Trade Enterprises", lead: "Blessing Okpale", role: "Lead", logo: cmdLogo, description: "Tourism and trade enterprise development across West Africa." },
];

const sponsorTiers = [
  {
    tier: "Platinum Sponsors",
    tierStyle: "bg-accent text-accent-foreground",
    sponsors: [
      { name: "West Africa Bank", logo: waBankLogo, description: "Financial services and banking solutions for the programme." },
      { name: "Sahel Energy Group", logo: sahelEnergyLogo, description: "Powering sustainable development across the ECOWAS region." },
      { name: "AfriConnect Solutions", logo: africonnectLogo, description: "Digital infrastructure and technology solutions." },
    ],
  },
  {
    tier: "Gold Sponsors",
    tierStyle: "bg-secondary text-secondary-foreground",
    sponsors: [
      { name: "Atlantic Telecom", logo: atlanticTelecomLogo, description: "Telecommunications and connectivity across West Africa." },
      { name: "Unity Insurance", logo: unityInsuranceLogo, description: "Risk management and insurance services." },
      { name: "Coastal Logistics", logo: coastalLogisticsLogo, description: "Transportation and logistics support." },
      { name: "Abuja Hotels Group", logo: abujaHotelsLogo, description: "Accommodation and hospitality for delegates." },
    ],
  },
  {
    tier: "Sponsors",
    tierStyle: "bg-muted text-muted-foreground",
    sponsors: [
      { name: "Pan-African Media", logo: panAfricanMediaLogo, description: "Media coverage and communication outreach." },
      { name: "Green Valley Agro", logo: greenValleyLogo, description: "Agricultural development and food security initiatives." },
      { name: "Accra Digital Hub", logo: accraDigitalLogo, description: "Digital innovation and youth entrepreneurship support." },
    ],
  },
];

const Stakeholders = () => {
  return (
    <Layout>
      <section className="relative bg-gradient-hero text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/announcement/23.jpg')" }} />
        <div className="container relative">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">Stakeholders & Partners</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              Leadership, co-organisers, and sponsors driving the 25th anniversary programme.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-8">ECOWAS Parliament Leadership</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadership.map((person, i) => (
              <AnimatedSection key={person.name} delay={i * 100}>
                <div className="rounded-xl bg-card border border-border shadow-sm text-center overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img src={person.image} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-card-foreground">{person.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{person.title}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-8">
              <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                Programme Co-Organisers
              </span>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {implementingPartners.map((partner, i) => (
              <AnimatedSection key={partner.name} delay={i * 100}>
                <div className="p-6 rounded-xl bg-card border-2 border-primary/20 shadow-md hover:shadow-xl transition-shadow">
                  <img src={partner.logo} alt={partner.name} className="h-14 w-auto mb-4" loading="lazy" />
                  <h3 className="font-bold text-card-foreground">{partner.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">
                    {partner.lead} — {partner.role}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {sponsorTiers.map((tierGroup, ti) => (
        <section key={tierGroup.tier} className={ti % 2 === 0 ? "py-16" : "py-16 bg-muted/50"}>
          <div className="container">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-8">
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tierGroup.tierStyle}`}>
                  {tierGroup.tier}
                </span>
              </div>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tierGroup.sponsors.map((partner, i) => (
                <AnimatedSection key={partner.name} delay={i * 100}>
                  <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-shadow">
                    <div className="rounded-2xl border border-border bg-muted/20 min-h-28 flex items-center justify-center p-4">
                      <img src={partner.logo} alt={partner.name} className="max-h-14 w-auto object-contain" loading="lazy" />
                    </div>
                    <h3 className="font-bold text-card-foreground mt-4">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      ))}
    </Layout>
  );
};

export default Stakeholders;
