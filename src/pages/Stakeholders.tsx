import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { User } from "lucide-react";
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

const leadership = [
  { name: "Rt. Hon. Hadja Mémounatou Ibrahima", title: "Speaker of the ECOWAS Parliament", image: "/announcement/1.jpg" },
  { name: "Mrs. Uche Duru", title: "Chief Communication Officer, ECOWAS Parliament", image: "/announcement/15.jpg" },
  { name: "Dr. Kabeer Garba", title: "Ag. Director, Department of Parliamentary Affairs", image: "/announcement/13.jpg" },
];

const sponsorTiers = [
  {
    tier: "Implementing Partners",
    tierStyle: "bg-primary text-primary-foreground",
    sponsors: [
      { name: "Duchess NL", lead: "Dr. Victoria Akai IIPM", role: "CEO", logo: duchessLogo, description: "Leading implementing partner coordinating the year-long programme." },
      { name: "Borderless Trade & Investment", lead: "Dr. Olori Boye-Ajayi", role: "Managing Partner", logo: borderlessLogo, description: "Expertise in trade facilitation and regional economic integration." },
      { name: "CMD Tourism & Trade Enterprises", lead: "Blessing Okpale", role: "Lead", logo: cmdLogo, description: "Tourism and trade enterprise development across West Africa." },
    ],
  },
  {
    tier: "Platinum Sponsors",
    tierStyle: "bg-accent text-accent-foreground",
    sponsors: [
      { name: "West Africa Bank", lead: "Financial Partner", role: "", logo: waBankLogo, description: "Providing financial services and banking solutions for the programme." },
      { name: "Sahel Energy Group", lead: "Energy Partner", role: "", logo: sahelEnergyLogo, description: "Powering sustainable development across the ECOWAS region." },
      { name: "AfriConnect Solutions", lead: "Technology Partner", role: "", logo: africonnectLogo, description: "Digital infrastructure and technology solutions for the programme." },
    ],
  },
  {
    tier: "Gold Sponsors",
    tierStyle: "bg-secondary text-secondary-foreground",
    sponsors: [
      { name: "Atlantic Telecom", lead: "Telecom Partner", role: "", logo: atlanticTelecomLogo, description: "Telecommunications and connectivity across West Africa." },
      { name: "Unity Insurance", lead: "Insurance Partner", role: "", logo: unityInsuranceLogo, description: "Risk management and insurance services for programme activities." },
      { name: "Coastal Logistics", lead: "Logistics Partner", role: "", logo: coastalLogisticsLogo, description: "Transportation and logistics support for programme events." },
      { name: "Abuja Hotels Group", lead: "Hospitality Partner", role: "", logo: abujaHotelsLogo, description: "Accommodation and hospitality for programme delegates." },
    ],
  },
  {
    tier: "Sponsors",
    tierStyle: "bg-muted text-muted-foreground",
    sponsors: [
      { name: "Pan-African Media Network", lead: "Media Partner", role: "", logo: panAfricanMediaLogo, description: "Media coverage and communication outreach." },
      { name: "Green Valley Agro", lead: "Agriculture Partner", role: "", logo: greenValleyLogo, description: "Agricultural development and food security initiatives." },
      { name: "Accra Digital Hub", lead: "Innovation Partner", role: "", logo: accraDigitalLogo, description: "Digital innovation and youth entrepreneurship support." },
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
              Leadership and strategic partners driving the 25th anniversary programme.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Leadership */}
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
                    <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
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

      {/* Sponsor Tiers */}
      {sponsorTiers.map((tierGroup, ti) => (
        <section key={tierGroup.tier} className={ti % 2 === 0 ? "py-16 bg-muted/50" : "py-16"}>
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
                    <img src={partner.logo} alt={partner.name} className="h-14 w-auto mb-4" />
                    <h3 className="font-bold text-card-foreground">{partner.name}</h3>
                    <p className="text-sm text-primary font-medium mt-1">
                      {partner.lead}{partner.role ? ` — ${partner.role}` : ""}
                    </p>
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
