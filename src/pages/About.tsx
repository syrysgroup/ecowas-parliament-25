import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Target, Globe, Users, Handshake } from "lucide-react";

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-hero text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/announcement/15.jpg')" }} />
        <div className="container relative">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">About the Programme</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              Understanding the vision behind the ECOWAS Parliament 25th Anniversary year-long commemorative programme.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-4xl space-y-16">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why a Year-Long Programme?</h2>
            <p className="text-muted-foreground leading-relaxed">
              For 25 years, the ECOWAS Parliament has worked to advance democratic consolidation, regional trade,
              women's inclusion, and youth participation. Rather than organising a single ceremonial event, a strategic,
              multi-country programme has been designed to showcase tangible impact and bring the Parliament closer to its citizens.
            </p>
          </AnimatedSection>

          {/* Photo break */}
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-2xl overflow-hidden">
              {["/announcement/5.png", "/announcement/17.jpg", "/announcement/21.jpg"].map((src, i) => (
                <img key={i} src={src} alt="Programme highlight" loading="lazy" className="w-full h-40 md:h-52 object-cover" />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">A Living Story Across West Africa</h2>
            <p className="text-muted-foreground leading-relaxed">
              In 2026, the continuation of the 25th Anniversary celebration of the ECOWAS Parliament unfolds not as a single
              ceremonial moment, but as a living story told across West Africa — one that moves from capitals to communities,
              from policy halls to markets, classrooms, studios, and public squares. This anniversary is about people,
              participation, and progress.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6">Priority Focus Areas</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Target, title: "Youth Innovation", desc: "Youth innovation and parliamentary simulations" },
                { icon: Users, title: "Women's Empowerment", desc: "Women-focused trade and entrepreneurship platforms" },
                { icon: Globe, title: "Trade Facilitation", desc: "SME and trade facilitation forums" },
                { icon: Handshake, title: "Civic Engagement", desc: "Civic education, awareness campaigns, and cultural celebrations" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-5 rounded-xl bg-card border border-border">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Photo break */}
          <AnimatedSection>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src="/announcement/23.jpg" alt="ECOWAS Parliament partners" loading="lazy" className="w-full h-64 md:h-80 object-cover" />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">Strategic Partnerships</h2>
            <p className="text-muted-foreground leading-relaxed">
              Regional integration requires collaboration that goes beyond public institutions. The ECOWAS Parliament is
              partnering with private sector actors whose expertise in trade facilitation, SME development, women's empowerment,
              and youth innovation aligns with its objectives. The Secretary General of the ECOWAS Parliament coordinates
              implementation with authorised partners: Duchess N. Limited, CMD Tourism & Trade Enterprise, and Borderless Trade & Investment.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">ECOWAS Vision 2050</h2>
            <p className="text-muted-foreground leading-relaxed">
              This programme is rooted in the broader ECOWAS Vision 2050 — a roadmap for a fully integrated,
              prosperous, and peaceful West Africa. The 25th anniversary serves as a milestone to reflect on progress
              made and reaffirm the Parliament's commitment to realising this vision for the peoples of the region.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default About;
