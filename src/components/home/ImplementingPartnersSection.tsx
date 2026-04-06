import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { ExternalLink, Building2 } from "lucide-react";
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
        <AnimatedSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            {t("implPartners.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("implPartners.title")} <span className="text-primary">{t("implPartners.titleAccent")}</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t("implPartners.subtitle")}</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {partners.map((partner, i) => (
            <AnimatedSection key={partner.id} delay={i * 100}>
              <Link to={`/partners/${partner.slug}`} className="block h-full">
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-lg group h-full">
                  <div className="flex flex-col items-start gap-4">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt={partner.name} className="h-10 w-auto object-contain" loading="lazy" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-card-foreground">{partner.name}</h3>
                      {partner.lead_role && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 mb-2">
                          {partner.lead_role}
                        </span>
                      )}
                      {partner.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{partner.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        {partner.lead_name && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{t("implPartners.lead")}</span>
                            <span className="text-xs font-semibold text-foreground/80">{partner.lead_name}</span>
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {t("implPartners.learnMore")} <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
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
