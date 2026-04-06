import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorLogo from "@/components/shared/SponsorLogo";
import { Handshake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

interface SponsorRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  tier: string;
}

const SponsorPlaceholderSection = () => {
  const { t } = useTranslation();

  const { data: sponsors = [], isLoading } = useQuery<SponsorRow[]>({
    queryKey: ["sponsors-homepage"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("sponsors")
        .select("id, name, slug, logo_url, tier")
        .eq("is_published", true)
        .order("sort_order");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-6">
            <Handshake className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("sponsorPlaceholder.title")} <span className="text-primary">{t("sponsorPlaceholder.titleAccent")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("sponsorPlaceholder.subtitle")}</p>
        </AnimatedSection>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-48 rounded-2xl" />
              ))
            : sponsors.map((sponsor, i) => (
                <AnimatedSection key={sponsor.id} delay={i * 50}>
                  <Link to={`/sponsors/${sponsor.slug}`}>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="h-10 w-10 object-contain"
                          loading="lazy"
                          width={40}
                          height={40}
                          decoding="async"
                        />
                      ) : (
                        <SponsorLogo name={sponsor.name} color="hsl(var(--primary))" size={42} />
                      )}
                      <span className="text-sm font-semibold text-card-foreground">{sponsor.name}</span>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
        </div>

        <AnimatedSection className="text-center">
          <Link
            to="/sponsors"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("sponsorPlaceholder.becomeSponsor")}
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SponsorPlaceholderSection;
