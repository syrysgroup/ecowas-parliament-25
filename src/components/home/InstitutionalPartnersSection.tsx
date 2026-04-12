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
  description: string | null;
  logo_url: string | null;
}

const InstitutionalPartnersSection = () => {
  const { t } = useTranslation();

  const { data: institutionalPartners = [] } = useQuery<PartnerRow[]>({
    queryKey: ["partners-public", "institutional"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partners")
        .select("id, name, slug, description, logo_url")
        .eq("partner_type", "institutional")
        .eq("is_published", true)
        .order("sort_order");

      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!institutionalPartners.length) return null;

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container">

        {/* HEADER */}
        <AnimatedSection className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-ecowas-blue/10 border border-ecowas-blue/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ecowas-blue mb-4">
            {t("instPartners.badge")}
          </span>

          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("instPartners.title")}{" "}
            <span className="text-ecowas-blue">
              {t("instPartners.titleAccent")}
            </span>
          </h2>

          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("instPartners.subtitle")}
          </p>
        </AnimatedSection>

        {/* GRID */}
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-6
            gap-6 lg:gap-4
            max-w-6xl
            mx-auto
            items-center
            justify-items-center
          "
        >
          {institutionalPartners.map((partner, i) => (
            <AnimatedSection key={partner.id} delay={i * 70}>
              <Link
                to={`/partners/${partner.slug}`}
                className="group flex items-center justify-center w-full"
              >
                <div className="h-28 w-full flex items-center justify-center px-2">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={`${partner.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="
                        max-h-20
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
                    <Building2 className="h-12 w-12 text-ecowas-blue/40 transition-transform duration-300 group-hover:scale-110" />
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

export default InstitutionalPartnersSection;