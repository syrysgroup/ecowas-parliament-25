import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import { Badge } from "@/components/ui/badge";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";
import speakerImg from "@/assets/speaker-memounatou.jpeg";
import secgenImg from "@/assets/stakeholder-secgen.jpg";
import commsImage from "@/assets/stakeholder-comms.jpg";
import directorImage from "@/assets/stakeholder-director.jpg";
import teamPortrait1 from "@/assets/team-portrait-1.jpg";
import teamPortrait2 from "@/assets/team-portrait-2.jpg";
import teamPortrait3 from "@/assets/team-portrait-3.jpg";

const ecowasStakeholders = [
  { name: "Rt. Hon. Hadja Mémounatou Ibrahima", title: "Speaker of the ECOWAS Parliament", image: speakerImg },
  { name: "Hon. Alhaji Bah", title: "Secretary General, ECOWAS Parliament", image: secgenImg },
  { name: "Mrs. Uche Duru", title: "Chief Communication Officer", image: commsImage },
  { name: "Dr. Kabeer Garba", title: "Ag. Director, Parliamentary Affairs", image: directorImage },
];

const implementingPartners = [
  { name: "Duchess NL", lead: "Dr. Victoria Akai IIPM", role: "CEO", logo: duchessLogo, image: teamPortrait1, description: "Leading implementing partner coordinating the programme direction and executive partnerships." },
  { name: "Borderless Trade & Investment", lead: "Dr. Olori Boye-Ajayi", role: "Managing Partner", logo: borderlessLogo, image: teamPortrait2, description: "Driving trade diplomacy, regional engagement, and private-sector mobilisation." },
  { name: "CMD Tourism & Trade Enterprises", lead: "Madam Cecile Mambo Doumbe", role: "Lead", logo: cmdLogo, image: teamPortrait3, description: "Supporting programming, event experience, and community-facing delivery." },
];

const sponsors = [
  { name: "West African Development Bank", color: "hsl(var(--ecowas-blue))" },
  { name: "ECOWAS Commission", color: "hsl(var(--ecowas-green))" },
  { name: "African Union", color: "hsl(var(--accent))" },
  { name: "United Nations Development Programme", color: "hsl(var(--primary))" },
  { name: "GIZ West Africa", color: "hsl(var(--secondary))" },
  { name: "Access Bank Group", color: "hsl(var(--ecowas-yellow))" },
  { name: "Dangote Foundation", color: "hsl(var(--ecowas-lime))" },
];

const Stakeholders = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container">
          <AnimatedSection>
            <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
              People and Institutions
            </Badge>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">
              Stakeholders & Partners
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-primary-foreground/75">
              The programme now shows the faces behind implementation and ECOWAS leadership, alongside the co-organisers and supporting institutions shaping the 25th anniversary platform.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ECOWAS Leadership */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">
              ECOWAS Parliament leadership
            </h2>
          </AnimatedSection>

          {/* Featured Speaker — prominent but not too large */}
          <AnimatedSection className="mb-10 flex justify-center">
            <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-80 max-w-sm">
              <img
                src={ecowasStakeholders[0].image}
                alt={ecowasStakeholders[0].name}
                className="w-full aspect-[3/4] object-cover object-top"
                loading="lazy"
              />
              <div className="p-4">
                <Badge className="mb-3 bg-primary/90 text-primary-foreground border-0">
                  Speaker of the ECOWAS Parliament
                </Badge>
                <h3 className="text-xl font-black text-card-foreground">
                  {ecowasStakeholders[0].name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ecowasStakeholders[0].title}
                </p>
              </div>
            </article>
          </AnimatedSection>

          {/* Other leadership */}
          <div className="grid gap-6 md:grid-cols-3">
            {ecowasStakeholders.slice(1).map((person, index) => (
              <AnimatedSection key={person.name} delay={index * 60}>
                <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-full aspect-[4/3] object-cover object-top"
                    loading="lazy"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-black text-card-foreground">
                      {person.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {person.title}
                    </p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Partners */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection>
            <Badge className="mb-3 bg-primary/10 text-primary">
              Programme Co-Organisers
            </Badge>
            <h2 className="text-2xl font-black text-foreground">
              Implementation partners
            </h2>
          </AnimatedSection>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {implementingPartners.map((partner, index) => (
              <AnimatedSection key={partner.name} delay={index * 70}>
                <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full">
                  <img
                    src={partner.image}
                    alt={partner.lead}
                    className="w-full aspect-[4/3] object-cover object-top"
                    loading="lazy"
                  />
                  <div className="space-y-4 p-6">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-12 w-auto"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="text-xl font-black text-card-foreground">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-primary">
                        {partner.lead} — {partner.role}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {partner.description}
                    </p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Partners */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <Badge className="mb-3 bg-ecowas-blue/10 text-ecowas-blue">
              Strategic Alliances
            </Badge>
            <h2 className="text-2xl font-black text-foreground">
              Institutional partners
            </h2>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
            {[
              {
                name: "AWALCO",
                fullName: "Association of West African Legislative Correspondents",
                description: "A professional body uniting legislative journalists across West Africa to strengthen parliamentary reporting, media freedom, and public accountability in governance.",
                slug: "awalco",
              },
              {
                name: "Alliance for Economic Research and Ethics LTD/GTE",
                fullName: "Alliance for Economic Research and Ethics",
                description: "An organisation dedicated to evidence-based economic research and ethical governance, supporting policy development and institutional strengthening across the region.",
                slug: "alliance-economic-research",
              },
            ].map((partner, index) => (
              <AnimatedSection key={partner.name} delay={index * 70}>
                <Link to={`/partners/${partner.slug}`} className="block h-full">
                  <article className="overflow-hidden rounded-3xl border border-ecowas-blue/20 bg-card shadow-sm p-6 hover:border-ecowas-blue/40 transition-all hover:shadow-lg h-full flex flex-col">
                    <h3 className="text-xl font-black text-card-foreground">
                      {partner.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      {partner.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {partner.description}
                    </p>
                    <span className="mt-4 inline-flex items-center text-xs font-semibold text-primary">
                      Learn more →
                    </span>
                  </article>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">
              Sponsors & supporters
            </h2>
          </AnimatedSection>

          <div className="flex flex-wrap gap-4">
            {sponsors.map((sponsor, index) => (
              <AnimatedSection key={sponsor.name} delay={index * 40}>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                  <SponsorLogo
                    name={sponsor.name}
                    color={sponsor.color}
                    size={42}
                  />
                  <span className="text-sm font-semibold text-card-foreground">
                    {sponsor.name}
                  </span>
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
