import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import speakerImg from "@/assets/speaker-memounatou.jpeg";
import secgenImg from "@/assets/stakeholder-secgen.jpg";
import commsImage from "@/assets/stakeholder-comms.jpg";
import directorImage from "@/assets/stakeholder-director.jpg";

const ecowasStakeholders = [
  { name: "Rt. Hon. Hadja Mémounatou Ibrahima", title: "Speaker of the ECOWAS Parliament", image: speakerImg },
  { name: "Hon. Alhaji Bah", title: "Secretary General, ECOWAS Parliament", image: secgenImg },
  { name: "", title: "Director", image: directorImage },
  { name: "Mrs. Uche Duru", title: "Chief Communication Officer", image: commsImage },
];

const Stakeholders = () => {
  const { t } = useTranslation();

  const { data: implPartners = [] } = useQuery({
    queryKey: ["stakeholders-implementing-partners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("is_published", true)
        .eq("partner_type", "implementing")
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  const { data: instPartners = [] } = useQuery({
    queryKey: ["stakeholders-institutional-partners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("is_published", true)
        .eq("partner_type", "institutional")
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  const { data: sponsors = [] } = useQuery({
    queryKey: ["stakeholders-sponsors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsors")
        .select("id, name, slug, logo_url, tier")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

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

      {/* ECOWAS Leadership (still hardcoded — these are fixed positions) */}
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
              <AnimatedSection key={person.name || index} delay={index * 60}>
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

      {/* Implementing Partners — from DB */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection>
            <Badge className="mb-3 bg-primary/10 text-primary">{t("stakeholders.implPartnersBadge")}</Badge>
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.implPartnersTitle")}</h2>
          </AnimatedSection>
          {implPartners.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No implementing partners published yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {implPartners.map((partner: any, index: number) => (
                <AnimatedSection key={partner.id} delay={index * 70}>
                  <Link to={`/partners/${partner.slug}`} className="block h-full">
                    <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full h-full flex flex-col">
                      {partner.lead_image_url && (
                        <img src={partner.lead_image_url} alt={partner.lead_name || partner.name} className="w-full aspect-[4/3] object-cover object-top" loading="lazy" />
                      )}
                      <div className="space-y-4 p-6 flex-1">
                        {partner.logo_url && (
                          <img src={partner.logo_url} alt={partner.name} className="h-12 w-auto" loading="lazy" />
                        )}
                        <div>
                          <h3 className="text-xl font-black text-card-foreground">{partner.name}</h3>
                          {partner.lead_name && (
                            <p className="text-sm text-primary">{partner.lead_name}{partner.lead_role ? ` — ${partner.lead_role}` : ""}</p>
                          )}
                        </div>
                        {partner.description && (
                          <p className="text-sm text-muted-foreground">{partner.description}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Institutional Partners — from DB */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <Badge className="mb-3 bg-ecowas-blue/10 text-ecowas-blue">{t("stakeholders.instPartnersBadge")}</Badge>
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.instPartnersTitle")}</h2>
          </AnimatedSection>
          {instPartners.length === 0 ? (
            <p className="text-sm text-muted-foreground">No institutional partners published yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
              {instPartners.map((partner: any, index: number) => (
                <AnimatedSection key={partner.id} delay={index * 70}>
                  <Link to={`/partners/${partner.slug}`} className="block h-full">
                    <article className="overflow-hidden rounded-3xl border border-ecowas-blue/20 bg-card shadow-sm p-6 hover:border-ecowas-blue/40 transition-all hover:shadow-lg h-full flex flex-col">
                      <h3 className="text-xl font-black text-card-foreground">{partner.name}</h3>
                      {partner.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mt-3">{partner.description}</p>
                      )}
                      <span className="mt-4 inline-flex items-center text-xs font-semibold text-primary">{t("stakeholders.learnMore")}</span>
                    </article>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sponsors — from DB */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.sponsorsTitle")}</h2>
          </AnimatedSection>
          {sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sponsors published yet.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {sponsors.map((sponsor: any, index: number) => (
                <AnimatedSection key={sponsor.id} delay={index * 40}>
                  <Link to={`/sponsors/${sponsor.slug}`}>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm hover:border-primary/30 transition-all">
                      {sponsor.logo_url ? (
                        <img src={sponsor.logo_url} alt={sponsor.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <SponsorLogo name={sponsor.name} color="hsl(var(--primary))" size={42} />
                      )}
                      <span className="text-sm font-semibold text-card-foreground">{sponsor.name}</span>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Stakeholders;
