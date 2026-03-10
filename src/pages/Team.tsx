import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";

const teamMembers = [
  { name: "Dr. Victoria Akai IIPM", role: "CEO, Duchess NL", org: "Implementing Partner", photo: "/announcement/30.jpg" },
  { name: "Dr. Olori Boye-Ajayi", role: "Managing Partner, Borderless Trade & Investment", org: "Implementing Partner", photo: "/announcement/31.jpg" },
  { name: "Blessing Okpale", role: "Lead, CMD Tourism & Trade Enterprises", org: "Implementing Partner", photo: "/announcement/28.jpg" },
];

const Team = () => {
  return (
    <Layout>
      <section className="relative bg-gradient-hero text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/announcement/25.jpg')" }} />
        <div className="container relative">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, i) => (
              <AnimatedSection key={member.name} delay={i * 100}>
                <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-56 overflow-hidden">
                    <img
                      src={member.photo}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="font-bold text-card-foreground">{member.name}</h3>
                    <p className="text-sm text-primary mt-1">{member.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{member.org}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Event photos */}
          <AnimatedSection className="mt-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">From the Announcement Event</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["/announcement/33.jpg", "/announcement/35.jpg", "/announcement/37.jpg", "/announcement/39.jpg",
                "/announcement/40.jpg", "/announcement/42.jpg", "/announcement/44.jpg", "/announcement/46.jpg"].map((src, i) => (
                <img key={i} src={src} alt="Announcement event" loading="lazy" className="w-full h-40 object-cover rounded-xl border border-border shadow-sm" />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Team;
