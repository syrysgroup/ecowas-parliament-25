import { useState, useEffect, useRef } from "react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import parliament25Logo from "@/assets/parliament-25-logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ── Tier config ── */
const TIERS = {
  presenting: { label: "PRESENTING SPONSOR", color: "border-primary text-primary bg-primary/8", size: "lg" },
  gold:       { label: "GOLD SPONSOR",       color: "border-accent text-accent bg-accent/8",     size: "md" },
  silver:     { label: "SILVER SPONSOR",      color: "border-muted-foreground/50 text-muted-foreground bg-muted/40", size: "sm" },
  bronze:     { label: "BRONZE SPONSOR",      color: "border-[hsl(25_85%_55%)] text-[hsl(25_85%_55%)] bg-[hsl(25_85%_55%/0.08)]", size: "sm" },
  standard:   { label: "SPONSOR",             color: "border-border text-muted-foreground bg-card", size: "sm" },
} as const;

type TierKey = keyof typeof TIERS;

const PROGRAMME_META: Record<string, { label: string; emoji: string; description: string }> = {
  youth:   { label: "Youth Innovation", emoji: "🚀", description: "Empowering young West Africans through digital skills, entrepreneurship, and civic tech innovation." },
  trade:   { label: "Trade & SME", emoji: "🤝", description: "Facilitating cross-border trade, supporting SMEs, and promoting economic integration." },
  women:   { label: "Women's Forum", emoji: "⚡", description: "Advancing gender equality and women's economic empowerment." },
  civic:   { label: "Civic Education", emoji: "🏛️", description: "Strengthening democratic governance through civic awareness." },
  culture: { label: "Culture & Creativity", emoji: "🎨", description: "Celebrating and preserving West African cultural heritage." },
  awards:  { label: "AWALCO Awards", emoji: "🏆", description: "Recognising outstanding contributions to regional integration." },
  parliament: { label: "Youth Parliament", emoji: "🌍", description: "Simulating parliamentary proceedings for young people." },
};

const PROGRAMME_IDS = ["youth", "trade", "women", "civic", "culture", "awards", "parliament"];

const SponsorsSection = () => {
  const [activeTab, setActiveTab] = useState("youth");
  const [animKey, setAnimKey] = useState(0);

  const { data: allSponsors = [] } = useQuery({
    queryKey: ["homepage-sponsors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsors")
        .select("id, name, slug, logo_url, description, tier, programmes, website")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => { setAnimKey(k => k + 1); }, [activeTab]);

  const activeMeta = PROGRAMME_META[activeTab] || PROGRAMME_META.youth;

  // Filter sponsors for active programme
  const programmeSponsors = allSponsors.filter(
    (s: any) => s.programmes && s.programmes.includes(activeTab)
  );

  // Group by tier
  const tierOrder: TierKey[] = ["presenting", "gold", "silver", "bronze", "standard"];
  const groupedTiers = tierOrder
    .map(tier => ({
      tier,
      sponsors: programmeSponsors.filter((s: any) => s.tier === tier),
    }))
    .filter(g => g.sponsors.length > 0);

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background border-t border-b border-border overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Partners & Sponsors</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Our Partner Ecosystem</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl">
              Each programme is powered by dedicated partners scoped exclusively to their designated initiative.
            </p>
          </AnimatedSection>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto scrollbar-none mb-10">
          <div className="inline-flex gap-1 p-1.5 bg-card border border-border rounded-xl min-w-fit">
            {PROGRAMME_IDS.map((id) => {
              const meta = PROGRAMME_META[id];
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    activeTab === id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="mr-1.5">{meta.emoji}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Programme content */}
        <div key={animKey} className="animate-fade-in">
          <div className="flex items-start gap-5 mb-8 p-6 rounded-2xl bg-card/60 border border-border">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <span className="text-2xl">{activeMeta.emoji}</span> {activeMeta.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{activeMeta.description}</p>
            </div>
          </div>

          {/* Sponsor tiers */}
          {groupedTiers.length > 0 ? (
            <div className="space-y-8">
              {groupedTiers.map((tierGroup, tierIdx) => {
                const cfg = TIERS[tierGroup.tier];
                return (
                  <div key={tierGroup.tier}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className={`grid gap-6 ${
                      tierGroup.tier === "presenting" ? "grid-cols-1 sm:grid-cols-2" :
                      tierGroup.tier === "gold" ? "grid-cols-2 md:grid-cols-3" :
                      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                    }`}>
                      {tierGroup.sponsors.map((sponsor: any, sIdx: number) => (
                        <Link
                          key={sponsor.id}
                          to={`/sponsors/${sponsor.slug}`}
                          className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                          style={{
                            animationDelay: `${(tierIdx * 150) + (sIdx * 80)}ms`,
                            animation: "fade-in 0.5s ease-out both",
                          }}
                        >
                          {/* Logo — large, bold, centred */}
                          <div className={`w-full flex items-center justify-center rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
                            tierGroup.tier === "presenting" ? "h-32 bg-primary/5 p-4" :
                            tierGroup.tier === "gold" ? "h-24 bg-amber-50/50 dark:bg-amber-950/20 p-3" :
                            "h-20 bg-muted/50 p-3"
                          }`}>
                            {sponsor.logo_url ? (
                              <img
                                src={sponsor.logo_url}
                                alt={sponsor.name}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <span className={`font-black text-muted-foreground/40 ${
                                tierGroup.tier === "presenting" ? "text-5xl" :
                                tierGroup.tier === "gold" ? "text-4xl" : "text-3xl"
                              }`}>
                                {sponsor.name.charAt(0)}
                              </span>
                            )}
                          </div>

                          {/* Name below logo */}
                          <div className="text-center">
                            <p className={`font-bold text-card-foreground leading-tight ${
                              tierGroup.tier === "presenting" ? "text-base" :
                              tierGroup.tier === "gold" ? "text-sm" : "text-xs"
                            }`}>
                              {sponsor.name}
                            </p>
                            {sponsor.description && tierGroup.tier === "presenting" && (
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                {sponsor.description}
                              </p>
                            )}
                          </div>

                          {/* Hover arrow */}
                          <span className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            View Profile →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No sponsors confirmed yet for this programme.</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 text-center py-10 bg-gradient-to-br from-primary/5 via-background/50 to-accent/5 border border-dashed border-primary/20 rounded-2xl">
            <span className="text-3xl block mb-3">{activeMeta.emoji}</span>
            <h3 className="text-xl font-black text-foreground mb-2">Sponsor {activeMeta.label}</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">Presenting, Gold and Silver opportunities available.</p>
            <Button asChild>
              <Link to="/contact">Enquire →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;