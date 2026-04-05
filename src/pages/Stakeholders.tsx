import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
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
  { name: "", title: "Director", image: directorImage },
  { name: "Mrs. Uche Duru", title: "Chief Communication Officer", image: commsImage },

];

const implementingPartners = [
  { name: "Duchess NL", lead: "Dr. Victoria Akai IIPM", role: "CEO", logo: duchessLogo, image: teamPortrait1, descKey: "implPartners.duchess.desc" },
  { name: "Borderless Trade & Investment", lead: "Dr. Olori Boye-Ajayi", role: "Managing Partner", logo: borderlessLogo, image: teamPortrait2, descKey: "implPartners.borderless.desc" },
  { name: "CMD Tourism & Trade Enterprises", lead: "Madam Cecile Mambo Doumbe", role: "Lead", logo: cmdLogo, image: teamPortrait3, descKey: "implPartners.cmd.desc" },
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
  const { t } = useTranslation();

  return (
    <Layout>
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container">
          <AnimatedSection>
            <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">{t("stakeholders.badge")}</Badge>
            <h1 className="mt-4 text-4xl font-black md:text-5xl">{t("stakeholders.heroTitle")}</h1>
            <p className="mt-4 max-w-3xl text-lg text-primary-foreground/75">{t("stakeholders.heroDesc")}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.ecowasLeadership")}</h2>
          </AnimatedSection>
          <AnimatedSection className="mb-10 flex justify-center">
            <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-80 max-w-sm">
              <img src={ecowasStakeholders[0].image} alt={ecowasStakeholders[0].name} className="w-full aspect-[3/4] object-cover object-top" loading="lazy" />
              <div className="p-4">
                <Badge className="mb-3 bg-primary/90 text-primary-foreground border-0">{t("speaker.badge")}</Badge>
                <h3 className="text-xl font-black text-card-foreground">{ecowasStakeholders[0].name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{ecowasStakeholders[0].title}</p>
              </div>
            </article>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-3">
            {ecowasStakeholders.slice(1).map((person, index) => (
              <AnimatedSection key={person.name} delay={index * 60}>
                <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full">
                  <img src={person.image} alt={person.name} className="w-full aspect-[4/3] object-cover object-top" loading="lazy" />
                  <div className="p-5">
                    <h3 className="text-xl font-black text-card-foreground">{person.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{person.title}</p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection>
            <Badge className="mb-3 bg-primary/10 text-primary">{t("stakeholders.implPartnersBadge")}</Badge>
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.implPartnersTitle")}</h2>
          </AnimatedSection>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {implementingPartners.map((partner, index) => (
              <AnimatedSection key={partner.name} delay={index * 70}>
                <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full">
                  <img src={partner.image} alt={partner.lead} className="w-full aspect-[4/3] object-cover object-top" loading="lazy" />
                  <div className="space-y-4 p-6">
                    <img src={partner.logo} alt={partner.name} className="h-12 w-auto" loading="lazy" />
                    <div>
                      <h3 className="text-xl font-black text-card-foreground">{partner.name}</h3>
                      <p className="text-sm text-primary">{partner.lead} — {partner.role}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{t(partner.descKey)}</p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <Badge className="mb-3 bg-ecowas-blue/10 text-ecowas-blue">{t("stakeholders.instPartnersBadge")}</Badge>
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.instPartnersTitle")}</h2>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
            {[
              { name: "AWALCO", fullNameKey: "instPartners.awalco.fullName", descKey: "instPartners.awalco.desc", slug: "awalco" },
              { name: "Alliance for Economic Research and Ethics LTD/GTE", fullNameKey: "instPartners.alliance.fullName", descKey: "instPartners.alliance.desc", slug: "alliance-economic-research" },
            ].map((partner, index) => (
              <AnimatedSection key={partner.name} delay={index * 70}>
                <Link to={`/partners/${partner.slug}`} className="block h-full">
                  <article className="overflow-hidden rounded-3xl border border-ecowas-blue/20 bg-card shadow-sm p-6 hover:border-ecowas-blue/40 transition-all hover:shadow-lg h-full flex flex-col">
                    <h3 className="text-xl font-black text-card-foreground">{partner.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{t(partner.fullNameKey)}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t(partner.descKey)}</p>
                    <span className="mt-4 inline-flex items-center text-xs font-semibold text-primary">{t("stakeholders.learnMore")}</span>
                  </article>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.sponsorsTitle")}</h2>
          </AnimatedSection>
          <div className="flex flex-wrap gap-4">
            {sponsors.map((sponsor, index) => (
              <AnimatedSection key={sponsor.name} delay={index * 40}>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                  <SponsorLogo name={sponsor.name} color={sponsor.color} size={42} />
                  <span className="text-sm font-semibold text-card-foreground">{sponsor.name}</span>
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
