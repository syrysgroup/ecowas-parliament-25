import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ImplementingPartnersSection = () => {
  const { t } = useTranslation();

  const { data: partners = [] } = useQuery({
    queryKey: ["partners-public", "implementing"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partners")
        .select("id, name, slug, logo_url, description, lead_name, lead_role")
        .eq("partner_type", "implementing")
        .eq("is_published", true)
        .order("sort_order");
      return (data ?? []) as {
        id: string; name: string; slug: string; logo_url: string | null;
        description: string | null; lead_name: string | null; lead_role: string | null;
      }[];
    },
  });

  if (partners.length === 0) return null;

  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            {t("implPartners.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("implPartners.title")} <span className="text-primary">{t("implPartners.titleAccent")}</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t("implPartners.subtitle")}</p>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto items-center justify-items-center">
          {partners.map((partner, i) => (
            <AnimatedSection key={partner.id} delay={i * 80}>
              <Link
                to={`/partners/${partner.slug}`}
                className="group flex flex-col items-center gap-3 text-center"
              >
                <div className="h-20 flex items-center justify-center">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-h-full max-w-[160px] object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-xl"
                      loading="lazy"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-primary/40 transition-transform duration-300 group-hover:scale-110" />
                  )}
                </div>
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{partner.name}</p>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImplementingPartnersSection;
