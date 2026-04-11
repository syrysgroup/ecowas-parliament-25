import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const InstitutionalPartnersSection = () => {
  const { t } = useTranslation();

  const { data: institutionalPartners = [] } = useQuery({
    queryKey: ["partners-public", "institutional"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partners")
        .select("id, name, slug, description, logo_url")
        .eq("partner_type", "institutional")
        .eq("is_published", true)
        .order("sort_order");
      return (data ?? []) as {
        id: string; name: string; slug: string;
        description: string | null; logo_url: string | null;
      }[];
    },
  });

  if (institutionalPartners.length === 0) return null;

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-ecowas-blue/10 border border-ecowas-blue/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ecowas-blue mb-4">
            {t("instPartners.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("instPartners.title")} <span className="text-ecowas-blue">{t("instPartners.titleAccent")}</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t("instPartners.subtitle")}</p>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {institutionalPartners.map((partner, i) => (
            <AnimatedSection key={partner.id} delay={i * 80}>
              <Link
                to={`/partners/${partner.slug}`}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border border-border hover:border-ecowas-blue/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-full h-24 flex items-center justify-center bg-muted/40 rounded-xl overflow-hidden group-hover:bg-ecowas-blue/5 transition-colors duration-300 p-3">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-ecowas-blue/40" />
                  )}
                </div>
                <div className="text-center flex-1">
                  <p className="font-bold text-sm text-card-foreground leading-tight">{partner.name}</p>
                  {partner.description && (
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{partner.description}</p>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-ecowas-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("common.learnMore")} <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstitutionalPartnersSection;