import { useState, useEffect } from "react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TIERS = {
  presenting: { label: "Presenting", ribbon: "bg-primary text-primary-foreground" },
  gold:       { label: "Gold",       ribbon: "bg-amber-500 text-white" },
  silver:     { label: "Silver",     ribbon: "bg-slate-400 text-white" },
  bronze:     { label: "Bronze",     ribbon: "bg-orange-600 text-white" },
  standard:   { label: "Sponsor",    ribbon: "bg-muted text-muted-foreground" },
} as const;
type TierKey = keyof typeof TIERS;

const PROGRAMME_META: Record<string, { label: string; emoji: string; description: string }> = {
  youth:      { label: "Youth Innovation",    emoji: "🚀", description: "Empowering young West Africans through digital skills, entrepreneurship, and civic tech innovation." },
  trade:      { label: "Trade & SME",         emoji: "🤝", description: "Facilitating cross-border trade, supporting SMEs, and promoting economic integration." },
  women:      { label: "Women's Forum",       emoji: "⚡", description: "Advancing gender equality and women's economic empowerment." },
  civic:      { label: "Civic Education",     emoji: "🏛️", description: "Strengthening democratic governance through civic awareness." },
  culture:    { label: "Culture & Creativity",emoji: "🎨", description: "Celebrating and preserving West African cultural heritage." },
  awards:     { label: "AWALCO Awards",       emoji: "🏆", description: "Recognising outstanding contributions to regional integration." },
  parliament: { label: "Youth Parliament",    emoji: "🌍", description: "Simulating parliamentary proceedings for young people." },
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
        .select("id, name, slug, logo_url, tier, programmes")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => { setAnimKey(k => k + 1); }, [activeTab]);

  const activeMeta = PROGRAMME_META[activeTab] ?? PROGRAMME_META.youth;
  const programmeSponsors = allSponsors.filter(
    (s: any) => s.programmes?.includes(activeTab)
  );
  const tierOrder: TierKey[] = ["presenting", "gold", "silver", "bronze", "standard"];
  const groupedTiers = tierOrder
    .map(tier => ({ tier, sponsors: programmeSponsors.filter((s: any) => s.tier === tier) }))
    .filter(g => g.sponsors.length > 0);

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background border-t border-b border-border overflow-hidden">
      <div className="container">
        {/* Header */}
        <AnimatedSection className="mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Partners & Sponsors</Badge>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">Our Partner Ecosystem</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl">
            Each programme is powered by dedicated partners scoped exclusively to their designated initiative.
          </p>
        </AnimatedSection>

        {/* Programme Tabs */}
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
                  <span className="hidden sm:inline">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Programme description */}
        <div key={animKey} className="animate-fade-in">
          <div className="mb-8 p-5 rounded-2xl bg-card/60 border border-border">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <span className="text-2xl">{activeMeta.emoji}</span>
              {activeMeta.label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{activeMeta.description}</p>
          </div>

          {/* Sponsor logos — NO card, just the logo floating */}
          {groupedTiers.length > 0 ? (
            <div className="space-y-12">
              {groupedTiers.map((tierGroup, tierIdx) => {
                const cfg = TIERS[tierGroup.tier];
                /* Size of logos scales with tier */
                const logoHeight =
                  tierGroup.tier === "presenting" ? 110 :
                  tierGroup.tier === "gold"       ? 85  :
                  tierGroup.tier === "silver"     ? 68  : 56;
                const cols =
                  tierGroup.tier === "presenting" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" :
                  tierGroup.tier === "gold"       ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5" :
                  "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6";

                return (
                  <div key={tierGroup.tier}>
                    {/* Tier label row */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${cfg.ribbon}`}>
                        {cfg.label}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {tierGroup.sponsors.length} sponsor{tierGroup.sponsors.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Pure logo grid — NO card wrapper */}
                    <div className={`grid ${cols} gap-x-8 gap-y-10 items-center justify-items-center`}>
                      {tierGroup.sponsors.map((sponsor: any, sIdx: number) => (
                        <Link
                          key={sponsor.id}
                          to={`/sponsors/${sponsor.slug}`}
                          className="group relative flex flex-col items-center gap-3"
                          style={{
                            animationDelay: `${(tierIdx * 100) + (sIdx * 60)}ms`,
                            animation: "fade-in 0.4s ease-out both",
                          }}
                        >
                          {/* Tier badge — subtle, top of logo */}
                          {tierGroup.tier !== "standard" && (
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.ribbon} opacity-80`}>
                              {cfg.label}
                            </span>
                          )}

                          {/* The logo itself — NO card, scales naturally */}
                          <div
                            className="flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-xl"
                            style={{ height: logoHeight }}
                          >
                            {sponsor.logo_url ? (
                              <img
                                src={sponsor.logo_url}
                                alt={sponsor.name}
                                style={{ maxHeight: logoHeight, maxWidth: "100%", objectFit: "contain" }}
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className="flex items-center justify-center rounded-2xl bg-muted text-muted-foreground font-black"
                                style={{ width: logoHeight, height: logoHeight, fontSize: logoHeight * 0.4 }}
                              >
                                {sponsor.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Sponsor name — under the logo, small */}
                          <span className="text-[11px] font-semibold text-muted-foreground/70 group-hover:text-foreground transition-colors text-center leading-tight max-w-[120px] truncate">
                            {sponsor.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
              <span className="text-4xl block mb-3">{activeMeta.emoji}</span>
              <p className="text-sm text-muted-foreground font-medium">No sponsors confirmed yet for this programme.</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-14 text-center py-10 bg-gradient-to-br from-primary/5 via-background/50 to-accent/5 border border-dashed border-primary/20 rounded-2xl">
            <span className="text-3xl block mb-3">{activeMeta.emoji}</span>
            <h3 className="text-xl font-black text-foreground mb-2">Become a Sponsor</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Your logo, boldly displayed alongside West Africa's premier parliamentary initiatives.
            </p>
            <Button asChild>
              <Link to="/contact">Enquire about Sponsorship →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;