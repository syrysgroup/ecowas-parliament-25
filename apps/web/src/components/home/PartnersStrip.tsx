import AnimatedSection from "@/components/shared/AnimatedSection";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PartnersStrip = () => {
  const { t } = useTranslation();

  const { data: partners = [] } = useQuery({
    queryKey: ["homepage-partners-strip"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners")
        .select("id, name, description, partner_type")
        .eq("is_published", true)
        .eq("partner_type", "institutional")
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  // Fallback to AWALCO if no institutional partners in DB
  const displayPartners = partners.length > 0
    ? partners
    : [{ id: "fallback", name: "AWALCO", description: t("instPartners.awalco.fullName") }];

  return (
    <section className="py-10 bg-muted/50 border-y border-border">
      <div className="container">
        <AnimatedSection className="text-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">
            {t("nav.partners")}
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {displayPartners.map((partner) => (
              <div key={partner.id}>
                <p className="text-lg font-bold text-foreground">{partner.name}</p>
                {partner.description && (
                  <p className="text-sm text-muted-foreground mt-1">{partner.description}</p>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PartnersStrip;
