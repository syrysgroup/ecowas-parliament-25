import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StakeholderProfile {
  id: string;
  name: string;
  title: string | null;
  image_url: string | null;
  category: string;
  display_order: number;
}

const Stakeholders = () => {
  const { t } = useTranslation();

  const { data: leadership = [], isLoading: leadLoading } = useQuery<StakeholderProfile[]>({
    queryKey: ["stakeholder-profiles", "all-active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("stakeholder_profiles")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      return data ?? [];
    },
  });

  const leadershipProfiles = leadership.filter(s => s.category === "leadership");
  const teamProfiles = leadership.filter(s => s.category === "team");
  const advisoryProfiles = leadership.filter(s => s.category === "advisory");

  const { data: implPartners = [] } = useQuery({
    queryKey: ["stakeholders-implementing-partners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners" as any)
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
        .from("partners" as any)
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
        .from("sponsors" as any)
        .select("id, name, slug, logo_url, tier")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  const [speaker, ...otherLeaders] = leadershipProfiles;

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

      {/* ECOWAS Leadership — from DB */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.ecowasLeadership")}</h2>
          </AnimatedSection>

          {leadLoading ? (
            <div className="flex justify-center mb-10">
              <Skeleton className="w-80 h-[420px] rounded-3xl" />
            </div>
          ) : speaker ? (
            <AnimatedSection className="mb-10 flex justify-center">
              <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-80 max-w-sm">
                {speaker.image_url ? (
                  <img
                    src={speaker.image_url}
                    alt={speaker.name}
                    className="w-full aspect-[3/4] object-cover object-top"
                    loading="eager"
                    fetchPriority="high"
                    width={320}
                    height={427}
                    decoding="async"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                    <span className="text-4xl font-black text-muted-foreground">{speaker.name.charAt(0)}</span>
                  </div>
                )}
                <div className="p-4">
                  <Badge className="mb-3 bg-primary/90 text-primary-foreground border-0">{t("speaker.badge")}</Badge>
                  <h3 className="text-base font-black text-card-foreground">{speaker.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{speaker.title}</p>
                </div>
              </article>
            </AnimatedSection>
          ) : null}

          {otherLeaders.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {otherLeaders.map((person, index) => (
                <AnimatedSection key={person.id} delay={index * 60}>
                  <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full">
                    {person.image_url ? (
                      <img
                        src={person.image_url}
                        alt={person.name}
                        className="w-full aspect-square object-cover object-top"
                        loading="lazy"
                        width={400}
                        height={400}
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <span className="text-4xl font-black text-muted-foreground">{person.name.charAt(0) || "?"}</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-base font-black text-card-foreground">{person.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{person.title}</p>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Team Profiles */}
      {teamProfiles.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container">
            <AnimatedSection className="mb-8">
              <h2 className="text-2xl font-black text-foreground">{t("stakeholders.teamSection")}</h2>
            </AnimatedSection>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {teamProfiles.map((person, index) => (
                <AnimatedSection key={person.id} delay={index * 60}>
                  <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full">
                    {person.image_url ? (
                      <img src={person.image_url} alt={person.name} className="w-full aspect-square object-cover object-top" loading="lazy" width={400} height={400} decoding="async" />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <span className="text-4xl font-black text-muted-foreground">{person.name.charAt(0) || "?"}</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-base font-black text-card-foreground">{person.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{person.title}</p>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Advisory Profiles */}
      {advisoryProfiles.length > 0 && (
        <section className="py-16">
          <div className="container">
            <AnimatedSection className="mb-8">
              <h2 className="text-2xl font-black text-foreground">{t("stakeholders.advisorySection")}</h2>
            </AnimatedSection>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {advisoryProfiles.map((person, index) => (
                <AnimatedSection key={person.id} delay={index * 60}>
                  <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full">
                    {person.image_url ? (
                      <img src={person.image_url} alt={person.name} className="w-full aspect-square object-cover object-top" loading="lazy" width={400} height={400} decoding="async" />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <span className="text-4xl font-black text-muted-foreground">{person.name.charAt(0) || "?"}</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-base font-black text-card-foreground">{person.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{person.title}</p>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Implementing Partners — from DB */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection>
            <Badge className="mb-3 bg-primary/10 text-primary">{t("stakeholders.implPartnersBadge")}</Badge>
            <h2 className="text-2xl font-black text-foreground">{t("stakeholders.implPartnersTitle")}</h2>
          </AnimatedSection>
          {(implPartners as any[]).length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No implementing partners published yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {(implPartners as any[]).map((partner: any, index: number) => (
                <AnimatedSection key={partner.id} delay={index * 70}>
                  <Link to={`/partners/${partner.slug}`} className="block h-full">
                    <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-sm w-full h-full flex flex-col">
                      {partner.lead_image_url && (
                        <img
                          src={partner.lead_image_url}
                          alt={partner.lead_name || partner.name}
                          className="w-full aspect-square object-cover object-top"
                          loading="lazy"
                          width={400}
                          height={400}
                          decoding="async"
                        />
                      )}
                      <div className="space-y-4 p-6 flex-1">
                        {partner.logo_url && (
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            className="h-12 w-auto"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <div>
                          <h3 className="text-base font-black text-card-foreground">{partner.name}</h3>
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
    <AnimatedSection className="mb-10 text-center">
      <Badge className="mb-3 bg-ecowas-blue/10 text-ecowas-blue">
        {t("stakeholders.instPartnersBadge")}
      </Badge>
      <h2 className="text-2xl font-black text-foreground">
        {t("stakeholders.instPartnersTitle")}
      </h2>
    </AnimatedSection>

    {(instPartners as any[]).length === 0 ? (
      <p className="text-sm text-muted-foreground text-center">
        No institutional partners published yet.
      </p>
    ) : (
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-6
          gap-x-4
          gap-y-8
          max-w-6xl
          mx-auto
          items-center
          justify-items-center
        "
      >
        {(instPartners as any[]).map((partner: any, index: number) => (
          <AnimatedSection key={partner.id} delay={index * 60}>
            <Link
              to={`/partners/${partner.slug}`}
              className="group flex items-center justify-center w-full transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="h-28 w-full flex items-center justify-center px-3">
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="
                      max-h-20
                      max-w-full
                      object-contain
                      grayscale
                      opacity-80
                      transition-all duration-300
                      group-hover:grayscale-0
                      group-hover:opacity-100
                      group-hover:scale-105
                    "
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="h-12 w-12 bg-muted rounded-full" />
                )}
              </div>
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
    <AnimatedSection className="mb-10 text-center">
      <h2 className="text-2xl font-black text-foreground">
        {t("stakeholders.sponsorsTitle")}
      </h2>
    </AnimatedSection>

    {(sponsors as any[]).length === 0 ? (
      <p className="text-sm text-muted-foreground text-center">
        No sponsors published yet.
      </p>
    ) : (
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-6
          gap-x-4
          gap-y-8
          max-w-6xl
          mx-auto
          items-center
          justify-items-center
        "
      >
        {(sponsors as any[]).map((sponsor: any, index: number) => (
          <AnimatedSection key={sponsor.id} delay={index * 60}>
            <Link
              to={`/sponsors/${sponsor.slug}`}
              className="group flex items-center justify-center w-full transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="h-28 w-full flex items-center justify-center px-3">
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.tier}
                    className="
                      max-h-20
                      max-w-full
                      object-contain
                      grayscale
                      opacity-80
                      transition-all duration-300
                      group-hover:grayscale-0
                      group-hover:opacity-100
                      group-hover:scale-105
                    "
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="h-12 w-12 bg-muted rounded-full" />
                )}
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