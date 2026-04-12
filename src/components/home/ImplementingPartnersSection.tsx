import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

interface PartnerRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  lead_name: string | null;
  lead_role: string | null;
}

const ImplementingPartnersSection = () => {
  const { t } = useTranslation();

  const { data: partners = [] } = useQuery<PartnerRow[]>({
    queryKey: ["partners-public", "implementing"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partners")
        .select(
          "id, name, slug, logo_url, description, lead_name, lead_role"
        )
        .eq("partner_type", "implementing")
        .eq("is_published", true)
        .order("sort_order");

      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!partners.length) return null;

  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">

        {/* HEADER */}
        <AnimatedSection className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            {t("implPartners.badge")}
          </span>

          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("implPartners.title")}{" "}
            <span className="text-primary">
              {t("implPartners.titleAccent")}
            </span>
          </h2>

          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("implPartners.subtitle")}
          </p>
        </AnimatedSection>

        {/* GRID */}
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-4
            gap-6 lg:gap-4
            max-w-5xl
            mx-auto
            place-items-center
            place-content-center
          "
        >
          {partners.map((partner, i) => (
            <AnimatedSection key={partner.id} delay={i * 80}>
              <Link
                to={`/partners/${partner.slug}`}
                className="group flex items-center justify-center w-full"
              >
                {/* LOGO */}
                <div className="h-40 w-full flex items-center justify-center">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={`${partner.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="
                        max-h-32
                        max-w-full
                        object-contain
                        mx-auto

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
                    <Building2 className="h-16 w-16 text-primary/40 transition-transform duration-300 group-hover:scale-110" />
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

export default ImplementingPartnersSection;