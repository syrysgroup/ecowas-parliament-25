import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { User, Building2 } from "lucide-react";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";

const leadership = [
  { name: "Rt. Hon. Hadja Mémounatou Ibrahima", title: "Speaker of the ECOWAS Parliament" },
  { name: "Mrs. Uche Duru", title: "Chief Communication Officer, ECOWAS Parliament" },
  { name: "Dr. Kabeer Garba", title: "Ag. Director, Department of Parliamentary Affairs" },
];

const partners = [
  { name: "Duchess NL", lead: "Dr. Victoria Akai IIPM", role: "CEO", logo: duchessLogo, description: "Leading implementing partner coordinating the year-long programme." },
  { name: "Borderless Trade & Investment", lead: "Dr. Olori Boye-Ajayi", role: "Managing Partner", logo: borderlessLogo, description: "Expertise in trade facilitation and regional economic integration." },
  { name: "CMD Tourism & Trade Enterprises", lead: "Blessing Okpale", role: "Lead", logo: cmdLogo, description: "Tourism and trade enterprise development across West Africa." },
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

      {/* Partners */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-8">Implementing Partners</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {partners.map((partner, i) => (
              <AnimatedSection key={partner.name} delay={i * 100}>
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-shadow">
                  <img src={partner.logo} alt={partner.name} className="h-14 w-auto mb-4" />
                  <h3 className="font-bold text-card-foreground">{partner.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">{partner.lead} — {partner.role}</p>
                  <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
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
