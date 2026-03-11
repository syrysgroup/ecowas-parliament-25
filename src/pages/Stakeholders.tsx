import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";

const leadership = [
  { name: "Rt. Hon. Hadja Mémounatou Ibrahima", title: "Speaker of the ECOWAS Parliament" },
  { name: "Mrs. Uche Duru", title: "Chief Communication Officer, ECOWAS Parliament" },
  { name: "Dr. Kabeer Garba", title: "Ag. Director, Department of Parliamentary Affairs" },
];

const implementingPartners = [
  { name: "Duchess NL", lead: "Dr. Victoria Akai IIPM", role: "CEO", logo: duchessLogo, description: "Leading implementing partner coordinating the year-long programme." },
  { name: "Borderless Trade & Investment", lead: "Dr. Olori Boye-Ajayi", role: "Managing Partner", logo: borderlessLogo, description: "Expertise in trade facilitation and regional economic integration." },
  { name: "CMD Tourism & Trade Enterprises", lead: "Blessing Okpale", role: "Lead", logo: cmdLogo, description: "Tourism and trade enterprise development across West Africa." },
];

const sponsors = [
  { name: "West African Development Bank", color: "#1a6b8a" },
  { name: "ECOWAS Commission", color: "#008244" },
  { name: "African Union", color: "#b8860b" },
  { name: "United Nations Development Programme", color: "#0072bc" },
  { name: "GIZ West Africa", color: "#c4161c" },
  { name: "Access Bank Group", color: "#e6550d" },
  { name: "Dangote Foundation", color: "#1a3a5c" },
];

const Stakeholders = () => {
  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
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
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-card-foreground">{person.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{person.title}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Implementing Partners — premium treatment */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Programme Co-Organisers</Badge>
            <h2 className="text-2xl font-bold text-foreground mb-8">Implementing Partners</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {implementingPartners.map((partner, i) => (
              <AnimatedSection key={partner.name} delay={i * 100}>
                <div className="relative p-6 rounded-xl bg-card border-2 border-primary/20 shadow-md hover:shadow-xl transition-shadow">
                  <Badge variant="outline" className="absolute top-3 right-3 text-[10px] border-primary/30 text-primary">
                    Co-Organiser
                  </Badge>
                  <img src={partner.logo} alt={partner.name} className="h-14 w-auto mb-4" />
                  <h3 className="font-bold text-card-foreground text-lg">{partner.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">{partner.lead} — {partner.role}</p>
                  <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-16 bg-muted/40">
        <div className="container">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-8">Sponsors & Supporters</h2>
          </AnimatedSection>
          <div className="flex flex-wrap gap-4">
            {sponsors.map((sponsor, i) => (
              <AnimatedSection key={sponsor.name} delay={i * 60}>
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border hover:shadow-md transition-all">
                  <SponsorLogo name={sponsor.name} color={sponsor.color} size={40} />
                  <span className="text-sm font-medium text-card-foreground">{sponsor.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Stakeholders;
