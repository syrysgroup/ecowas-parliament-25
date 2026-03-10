import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { User } from "lucide-react";

const teamMembers = [
  { name: "Dr. Victoria Akai IIPM", role: "CEO, Duchess NL", org: "Implementing Partner" },
  { name: "Dr. Olori Boye-Ajayi", role: "Managing Partner, Borderless Trade & Investment", org: "Implementing Partner" },
  { name: "Blessing Okpale", role: "Lead, CMD Tourism & Trade Enterprises", org: "Implementing Partner" },
];

const Team = () => {
  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">Implementation Team</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              The dedicated team bringing the ECOWAS Parliament @25 programme to life.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-10">
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Team photos will be uploaded soon. The implementation team works across all seven Member States
              to deliver this year-long commemorative programme.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, i) => (
              <AnimatedSection key={member.name} delay={i * 100}>
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm text-center hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-ecowas-yellow/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary/50" />
                  </div>
                  <h3 className="font-bold text-card-foreground">{member.name}</h3>
                  <p className="text-sm text-primary mt-1">{member.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{member.org}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Team;
