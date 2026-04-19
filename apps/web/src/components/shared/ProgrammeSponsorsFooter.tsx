import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorPlaceholderLogo from "@/components/shared/SponsorPlaceholderLogo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";

interface ProgrammeSponsorsFooterProps {
  programme?: string;
  tiers?: { label: string; sponsors: { name: string }[] }[];
  title?: string;
}

const TIER_ORDER = ["platinum", "gold", "silver", "standard", "bronze"];
const TIER_LABELS: Record<string, string> = {
  platinum: "Platinum Sponsors",
  gold: "Gold Sponsors",
  silver: "Silver Sponsors",
  standard: "Programme Partners",
  bronze: "Supporting Partners",
};

const ProgrammeSponsorsFooter = ({ programme, tiers: staticTiers, title = "Programme Sponsors & Partners" }: ProgrammeSponsorsFooterProps) => {
  const { data: dbSponsors } = useQuery({
    queryKey: ["programme-sponsors", programme],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsors")
        .select("id, name, logo_url, tier, description")
        .eq("is_published", true)
        .contains("programmes", [programme!])
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    enabled: !!programme,
  });

  // Build tiers from DB if programme is provided and we have data
  const tiers = (() => {
    if (programme && dbSponsors && dbSponsors.length > 0) {
      const grouped: Record<string, typeof dbSponsors> = {};
      dbSponsors.forEach((s) => {
        if (!grouped[s.tier]) grouped[s.tier] = [];
        grouped[s.tier].push(s);
      });
      return TIER_ORDER
        .filter(t => grouped[t]?.length)
        .map(t => ({
          label: TIER_LABELS[t] || t,
          sponsors: grouped[t].map(s => ({ name: s.name, logo_url: s.logo_url, description: (s as any).description as string | null | undefined })),
        }));
    }
    // Fallback to static tiers
    return (staticTiers ?? []).map(t => ({
      ...t,
      sponsors: t.sponsors.map(s => ({ ...s, logo_url: undefined as string | undefined | null, description: undefined as string | undefined | null })),
    }));
  })();

  if (tiers.length === 0) return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-xl mx-auto text-center">
        <AnimatedSection>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 mb-4">
            <Handshake size={24} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Become a Programme Sponsor</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Partner with ECOWAS Parliament Initiatives to support this programme and gain visibility
            across West Africa's most prestigious parliamentary platform.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
          >
            <Handshake size={15} />
            Partner With Us
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">ECOWAS Parliament Initiatives Sponsors</p>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </AnimatedSection>
        {tiers.map((tier, ti) => (
          <AnimatedSection key={ti} delay={ti * 100} className="mb-10 last:mb-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-5">{tier.label}</p>
            <div className="flex flex-wrap justify-center gap-8">
              {tier.sponsors.map((s, si) => (
                <div key={si} className="flex flex-col items-center gap-2 group">
                  <div className="p-3 rounded-xl bg-card border border-border group-hover:shadow-md transition-shadow duration-300 flex items-center justify-center min-w-[80px]">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={s.name} className="h-auto w-auto max-h-14 max-w-[140px] object-contain" loading="lazy" />
                    ) : (
                      <SponsorPlaceholderLogo name={s.name} size={56} />
                    )}
                  </div>
                  {s.logo_url ? (
                    (s as any).description && (
                      <span className="text-[10px] font-medium text-muted-foreground text-center max-w-[140px] leading-tight">{(s as any).description}</span>
                    )
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground text-center max-w-[80px] leading-tight">{s.name}</span>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

export default ProgrammeSponsorsFooter;
