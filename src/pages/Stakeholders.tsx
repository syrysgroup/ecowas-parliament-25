import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Building2 } from "lucide-react";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";

const leadership = [
  { name: "Rt. Hon. Hadja Mémounatou Ibrahima", title: "Speaker of the ECOWAS Parliament", photo: "/announcement/2.jpg" },
  { name: "Mrs. Uche Duru", title: "Chief Communication Officer, ECOWAS Parliament", photo: "/announcement/3.jpg" },
  { name: "Dr. Kabeer Garba", title: "Ag. Director, Department of Parliamentary Affairs", photo: "/announcement/7.jpg" },
];

const partners = [
  { name: "Duchess NL", lead: "Dr. Victoria Akai IIPM", role: "CEO", logo: duchessLogo, description: "Leading implementing partner coordinating the year-long programme." },
  { name: "Borderless Trade & Investment", lead: "Dr. Olori Boye-Ajayi", role: "Managing Partner", logo: borderlessLogo, description: "Expertise in trade facilitation and regional economic integration." },
  { name: "CMD Tourism & Trade Enterprises", lead: "Blessing Okpale", role: "Lead", logo: cmdLogo, description: "Tourism and trade enterprise development across West Africa." },
];

const eventHighlights = [
  { src: "/announcement/1.jpg", caption: "Official media announcement" },
  { src: "/announcement/5.png", caption: "Stakeholder engagement" },
  { src: "/announcement/9.jpg", caption: "Panel discussion" },
  { src: "/announcement/11.jpg", caption: "Anniversary celebration" },
  { src: "/announcement/15.jpg", caption: "Guest speakers" },
  { src: "/announcement/19.jpg", caption: "Programme overview" },
  { src: "/announcement/23.jpg", caption: "Dignitaries" },
  { src: "/announcement/25.jpg", caption: "Group photo" },
];

const Stakeholders = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-hero text-primary-foreground py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/announcement/1.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-primary/40" />
        <div className="container relative">
          <AnimatedSection>
            <h1 className="text-4xl md:text-6xl font-black">Stakeholders & Partners</h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
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
                <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-card-foreground">{person.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{person.title}</p>
                  </div>
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

      {/* Event Highlights */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">Event Highlights</h2>
            <p className="text-muted-foreground mt-2">Moments from the official announcement event.</p>
          </AnimatedSection>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {eventHighlights.map((img, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div className="break-inside-avoid overflow-hidden rounded-xl border border-border shadow-sm">
                  <img src={img.src} alt={img.caption} loading="lazy" className="w-full h-auto object-cover" />
                  <p className="text-xs text-muted-foreground p-2 text-center">{img.caption}</p>
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
