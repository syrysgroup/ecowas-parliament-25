import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Handshake, Building2 } from "lucide-react";
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

        {/* HEADER */}
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-6">
            <Handshake className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("sponsorPlaceholder.title")}{" "}
            <span className="text-primary">
              {t("sponsorPlaceholder.titleAccent")}
            </span>
          </h2>

          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t("sponsorPlaceholder.subtitle")}
          </p>
        </AnimatedSection>

        {/* GRID */}
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-6
            gap-3
            max-w-7xl
            mx-auto
            place-items-center
            place-content-center
          "
        >
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))
            : sponsors.map((sponsor, i) => (
                <AnimatedSection key={sponsor.id} delay={i * 70}>
                  <Link
                    to={`/sponsors/${sponsor.slug}`}
                    className="group flex items-center justify-center w-full"
                  >
                    <div className="h-32 w-full flex items-center justify-center px-1">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={`${sponsor.name} logo`}
                          loading="lazy"
                          decoding="async"
                          className="
                            max-h-24
                            max-w-full
                            object-contain

                            grayscale
                            opacity-80

                            transition-all
                            duration-300
                            ease-out

                            group-hover:grayscale-0
                            group-hover:opacity-100
                            group-hover:scale-105
                          "
                        />
                      ) : (
                        <Building2 className="h-14 w-14 text-primary/40 transition-transform duration-300 group-hover:scale-110" />
                      )}
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
        </div>

      </div>
    </section>
  );
};

export default SponsorPlaceholderSection;