import { useState } from "react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

/* ── Tier config ── */
const TIERS = {
  presenting: { label: "PRESENTING", badge: "border-primary text-primary bg-primary/5" },
  gold: { label: "GOLD", badge: "border-accent text-accent bg-accent/5" },
  silver: { label: "SILVER", badge: "border-muted-foreground/40 text-muted-foreground bg-muted/30" },
  bronze: { label: "BRONZE", badge: "border-[hsl(25_85%_55%)] text-[hsl(25_85%_55%)] bg-[hsl(25_85%_55%/0.06)]" },
  impl: { label: "IMPL", badge: "border-border text-muted-foreground bg-card" },
} as const;

type Tier = keyof typeof TIERS;

interface Sponsor { name: string; subtitle: string }
interface TierGroup { tier: Tier; sponsors: Sponsor[]; logoSrc?: string }
interface Programme { id: string; label: string; emoji: string; tiers: TierGroup[]; cta?: { emoji: string; title: string; subtitle: string } }

const programmes: Programme[] = [
  {
    id: "all", label: "Overview", emoji: "",
    tiers: [
      { tier: "presenting", sponsors: [{ name: "ECOWAS Commission", subtitle: "All Programmes" }], logoSrc: ecowasLogo },
      { tier: "gold", sponsors: [{ name: "AfDB", subtitle: "African Development Bank · All Programmes" }] },
      { tier: "silver", sponsors: [{ name: "UNDP", subtitle: "West Africa · Youth + Women's" }, { name: "EU", subtitle: "Delegation ECOWAS · Civic + Youth Parl" }] },
      { tier: "bronze", sponsors: [{ name: "DUCHESS", subtitle: "Duchess International · Trade & SME only" }] },
    ],
  },
  {
    id: "youth", label: "Youth Innovation", emoji: "🚀",
    tiers: [
      { tier: "gold", sponsors: [{ name: "AfDB", subtitle: "African Development Bank" }] },
      { tier: "silver", sponsors: [{ name: "UNDP", subtitle: "UNDP West Africa" }] },
    ],
    cta: { emoji: "🚀", title: "Sponsor Youth Innovation", subtitle: "Gold and Presenting opportunities available." },
  },
  {
    id: "trade", label: "Trade & SME", emoji: "🤝",
    tiers: [
      { tier: "gold", sponsors: [{ name: "AfDB", subtitle: "African Development Bank" }] },
      { tier: "bronze", sponsors: [{ name: "DUCHESS", subtitle: "Duchess International" }] },
      { tier: "impl", sponsors: [{ name: "WATH", subtitle: "West Africa Trade Hub" }] },
    ],
  },
  {
    id: "women", label: "Women's Forum", emoji: "⚡",
    tiers: [
      { tier: "silver", sponsors: [{ name: "UNDP", subtitle: "UNDP West Africa" }] },
    ],
    cta: { emoji: "⚡", title: "Partner with Women's Empowerment", subtitle: "Gold and Presenting tiers open." },
  },
  {
    id: "civic", label: "Civic Education", emoji: "🏛️",
    tiers: [
      { tier: "gold", sponsors: [{ name: "EU", subtitle: "EU Delegation ECOWAS" }] },
    ],
  },
  {
    id: "culture", label: "Culture", emoji: "🎨",
    tiers: [],
    cta: { emoji: "🎨", title: "Exclusive Presenting Sponsorship Open", subtitle: "Be the only Presenting Sponsor for Culture & Creativity." },
  },
  {
    id: "awards", label: "Awards", emoji: "🏆",
    tiers: [
      { tier: "gold", sponsors: [{ name: "AfDB", subtitle: "African Development Bank" }] },
    ],
  },
  {
    id: "yparl", label: "Youth Parliament", emoji: "🌍",
    tiers: [
      { tier: "gold", sponsors: [{ name: "EU", subtitle: "EU Delegation ECOWAS" }] },
    ],
  },
];

const SponsorsSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const active = programmes.find((p) => p.id === activeTab)!;

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background border-t border-b border-border">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Partners & Sponsors</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Our Partner Ecosystem</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl">
              Select a programme to view only its sponsors. Partners are scoped exclusively to
              their designated programme — never cross-attributed.
            </p>
          </AnimatedSection>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto scrollbar-none mb-9">
          <div className="inline-flex gap-1 p-1.5 bg-card border border-border rounded-xl min-w-fit">
            {programmes.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === p.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.emoji && <span className="mr-1.5">{p.emoji}</span>}
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tier rows */}
        {active.tiers.map((tierGroup) => {
          const cfg = TIERS[tierGroup.tier];
          return (
            <div key={tierGroup.tier} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                  {cfg.label}
                </span>
                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                  {cfg.label} Sponsors
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex items-center justify-center flex-wrap gap-4">
                {tierGroup.sponsors.map((sponsor) => (
                  <div
                    key={sponsor.name}
                    className="flex flex-col items-center justify-center gap-1.5 bg-card/50 border border-border rounded-xl px-5 py-4 hover:border-primary/30 hover:-translate-y-1 transition-all cursor-pointer"
                    style={{
                      width: tierGroup.tier === "presenting" ? 320 : tierGroup.tier === "gold" ? 190 : tierGroup.tier === "silver" ? 145 : 108,
                      minHeight: tierGroup.tier === "presenting" ? 96 : tierGroup.tier === "gold" ? 70 : 52,
                    }}
                  >
                    {tierGroup.logoSrc && (
                      <img src={tierGroup.logoSrc} alt={sponsor.name} className="h-12 object-contain" />
                    )}
                    <span className={`font-bold text-card-foreground text-center leading-tight ${
                      tierGroup.tier === "presenting" ? "text-lg" : tierGroup.tier === "gold" ? "text-sm" : "text-xs"
                    }`}>
                      {sponsor.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground text-center">{sponsor.subtitle}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Per-programme CTA or info note */}
        {active.cta ? (
          <div className="text-center py-10 bg-background/50 border border-dashed border-border rounded-xl mt-6">
            <span className="text-3xl block mb-3">{active.cta.emoji}</span>
            <h3 className="text-xl font-black text-foreground mb-2">{active.cta.title}</h3>
            <p className="text-sm text-muted-foreground mb-5">{active.cta.subtitle}</p>
            <Button asChild>
              <Link to="/contact">Enquire →</Link>
            </Button>
          </div>
        ) : activeTab === "all" ? (
          <div className="text-center p-5 bg-primary/5 border border-primary/15 rounded-lg text-xs text-muted-foreground">
            Select a programme tab to see that programme's sponsors only. Partners are never shown
            outside their designated programme(s).
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SponsorsSection;
