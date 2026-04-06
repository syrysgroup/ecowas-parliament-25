import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { Building2, ExternalLink } from "lucide-react";
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
        <AnimatedSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-ecowas-blue/10 border border-ecowas-blue/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ecowas-blue mb-4">
            {t("instPartners.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("instPartners.title")} <span className="text-ecowas-blue">{t("instPartners.titleAccent")}</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t("instPartners.subtitle")}</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {institutionalPartners.map((partner, i) => (
            <AnimatedSection key={partner.id} delay={i * 100}>
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-ecowas-blue/30 transition-all hover:shadow-lg group h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.name} className="h-12 w-12 object-contain rounded-xl bg-muted p-1 shrink-0" loading="lazy" />
                  ) : (
                    <div className="p-3 rounded-xl bg-ecowas-blue/10 text-ecowas-blue shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-card-foreground">{partner.name}</h3>
                  </div>
                </div>
                {partner.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{partner.description}</p>
                )}
                <Link to={`/partners/${partner.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  {t("common.learnMore")} <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstitutionalPartnersSection;
