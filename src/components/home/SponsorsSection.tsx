import { useState, useEffect, useRef } from "react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ── Tier config ── */
const TIERS = {
  presenting: { label: "PRESENTING SPONSOR", color: "border-primary text-primary bg-primary/8", cardClass: "col-span-full", size: "lg" },
  gold:       { label: "GOLD SPONSOR",       color: "border-accent text-accent bg-accent/8",     cardClass: "",             size: "md" },
  silver:     { label: "SILVER SPONSOR",      color: "border-muted-foreground/50 text-muted-foreground bg-muted/40", cardClass: "", size: "sm" },
  bronze:     { label: "BRONZE SPONSOR",      color: "border-[hsl(25_85%_55%)] text-[hsl(25_85%_55%)] bg-[hsl(25_85%_55%/0.08)]", cardClass: "", size: "sm" },
  impl:       { label: "IMPLEMENTING",        color: "border-border text-muted-foreground bg-card", cardClass: "", size: "sm" },
} as const;

type Tier = keyof typeof TIERS;

interface Sponsor { name: string; subtitle: string; role: string }
interface TierGroup { tier: Tier; sponsors: Sponsor[] }
interface Programme {
  id: string; label: string; emoji: string; description: string;
  projects: string[];
  tiers: TierGroup[];
  cta?: { title: string; subtitle: string };
}

/* ── Programme illustrations (inline SVG patterns) ── */
const ProgrammeIllustration = ({ id }: { id: string }) => {
  const colors: Record<string, [string, string]> = {
    youth:   ["hsl(142 50% 40%)", "hsl(48 90% 55%)"],
    trade:   ["hsl(48 90% 55%)", "hsl(0 60% 45%)"],
    women:   ["hsl(300 40% 50%)", "hsl(142 50% 40%)"],
    civic:   ["hsl(220 60% 50%)", "hsl(142 50% 40%)"],
    culture: ["hsl(0 60% 45%)", "hsl(48 90% 55%)"],
    awards:  ["hsl(48 90% 55%)", "hsl(220 60% 50%)"],
    yparl:   ["hsl(142 50% 40%)", "hsl(220 60% 50%)"],
  };
  const [c1, c2] = colors[id] || ["hsl(142 50% 40%)", "hsl(48 90% 55%)"];

  return (
    <svg viewBox="0 0 120 120" className="w-16 h-16 flex-shrink-0 opacity-80">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke={`url(#grad-${id})`} strokeWidth="3" opacity="0.4" />
      <circle cx="60" cy="60" r="35" fill={`url(#grad-${id})`} opacity="0.15" />
      <circle cx="60" cy="60" r="18" fill={`url(#grad-${id})`} opacity="0.3" />
      <circle cx="60" cy="60" r="5" fill={c1} />
    </svg>
  );
};

const programmes: Programme[] = [
  {
    id: "youth", label: "Youth Innovation", emoji: "🚀",
    description: "Empowering young West Africans through digital skills, entrepreneurship, and civic tech innovation programmes across all 15 member states.",
    projects: ["Youth Digital Skills Bootcamp", "ECOWAS Youth Innovation Challenge", "Startup Incubation Programme"],
    tiers: [
      { tier: "gold", sponsors: [{ name: "AfDB", subtitle: "African Development Bank", role: "Funding digital skills bootcamps and youth entrepreneurship grants across 15 member states" }] },
      { tier: "silver", sponsors: [{ name: "UNDP", subtitle: "UNDP West Africa", role: "Technical assistance for youth innovation hubs and mentorship programme design" }] },
    ],
    cta: { title: "Sponsor Youth Innovation", subtitle: "Presenting and Gold opportunities available — shape the next generation of West African leaders." },
  },
  {
    id: "trade", label: "Trade & SME", emoji: "🤝",
    description: "Facilitating cross-border trade, supporting SMEs, and promoting economic integration through policy dialogue and market access programmes.",
    projects: ["Cross-Border Trade Facilitation Forum", "SME Export Readiness Programme", "AfCFTA Implementation Support"],
    tiers: [
      { tier: "gold", sponsors: [{ name: "AfDB", subtitle: "African Development Bank", role: "Anchoring trade facilitation forums and SME financing instruments" }] },
      { tier: "bronze", sponsors: [{ name: "DUCHESS", subtitle: "Duchess International", role: "Supporting women-led trade enterprises and market linkage events" }] },
      { tier: "impl", sponsors: [{ name: "WATH", subtitle: "West Africa Trade Hub", role: "Providing technical trade data, logistics support, and regulatory analysis" }] },
    ],
  },
  {
    id: "women", label: "Women's Forum", emoji: "⚡",
    description: "Advancing gender equality and women's economic empowerment through leadership development, policy advocacy, and entrepreneurship support.",
    projects: ["Women in Leadership Summit", "Gender-Responsive Budgeting Workshop", "Women Entrepreneurs Fund"],
    tiers: [
      { tier: "silver", sponsors: [{ name: "UNDP", subtitle: "UNDP West Africa", role: "Supporting gender mainstreaming initiatives and women's leadership training" }] },
    ],
    cta: { title: "Partner with Women's Empowerment", subtitle: "Gold and Presenting tiers open — champion gender equality in West Africa." },
  },
  {
    id: "civic", label: "Civic Education", emoji: "🏛️",
    description: "Strengthening democratic governance through civic awareness campaigns, parliamentary engagement, and citizen participation programmes.",
    projects: ["Democracy Awareness Campaign", "Parliamentary Open Days", "Civic Tech for Governance"],
    tiers: [
      { tier: "gold", sponsors: [{ name: "EU", subtitle: "EU Delegation ECOWAS", role: "Funding civic education campaigns and democracy strengthening workshops" }] },
    ],
  },
  {
    id: "culture", label: "Culture & Creativity", emoji: "🎨",
    description: "Celebrating and preserving West African cultural heritage through arts festivals, creative industries development, and cultural exchange programmes.",
    projects: ["West African Arts Festival", "Creative Industries Development Programme", "Cultural Heritage Documentation"],
    tiers: [],
    cta: { title: "Exclusive Presenting Sponsorship Open", subtitle: "Be the sole Presenting Sponsor for Culture & Creativity — maximum brand visibility." },
  },
  {
    id: "awards", label: "Awards", emoji: "🏆",
    description: "Recognising outstanding contributions to regional integration, governance excellence, and community development across ECOWAS member states.",
    projects: ["Integration Excellence Awards", "Youth Achievement Awards", "Community Impact Recognition"],
    tiers: [
      { tier: "gold", sponsors: [{ name: "AfDB", subtitle: "African Development Bank", role: "Presenting partner for the Integration Excellence Awards ceremony" }] },
    ],
  },
  {
    id: "yparl", label: "Youth Parliament", emoji: "🌍",
    description: "Simulating parliamentary proceedings to develop young people's understanding of democratic processes, legislative debate, and regional cooperation.",
    projects: ["Model ECOWAS Parliament", "Youth Legislative Drafting Workshop", "Inter-Country Debate Championship"],
    tiers: [
      { tier: "gold", sponsors: [{ name: "EU", subtitle: "EU Delegation ECOWAS", role: "Core funding for the Model ECOWAS Parliament simulation and debate programmes" }] },
    ],
  },
];

const SponsorsSection = () => {
  const [activeTab, setActiveTab] = useState("youth");
  const [animKey, setAnimKey] = useState(0);
  const active = programmes.find((p) => p.id === activeTab)!;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnimKey(k => k + 1);
  }, [activeTab]);

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background border-t border-b border-border overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Partners & Sponsors</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Our Partner Ecosystem</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl">
              Each programme is powered by dedicated partners scoped exclusively to their designated initiative — never cross-attributed.
            </p>
          </AnimatedSection>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto scrollbar-none mb-10">
          <div className="inline-flex gap-1 p-1.5 bg-card border border-border rounded-xl min-w-fit">
            {programmes.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  activeTab === p.id
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="mr-1.5">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Programme content */}
        <div
          ref={contentRef}
          key={animKey}
          className="animate-fade-in"
        >
          {/* Programme header */}
          <div className="flex items-start gap-5 mb-8 p-6 rounded-2xl bg-card/60 border border-border">
            <ProgrammeIllustration id={active.id} />
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <span className="text-2xl">{active.emoji}</span> {active.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{active.description}</p>

              {/* Key projects */}
              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Key Projects</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {active.projects.map((project) => (
                    <span key={project} className="text-xs px-3 py-1.5 rounded-full bg-primary/8 text-primary border border-primary/15 font-medium">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sponsor tiers */}
          {active.tiers.length > 0 ? (
            <div className="space-y-8">
              {active.tiers.map((tierGroup, tierIdx) => {
                const cfg = TIERS[tierGroup.tier];
                return (
                  <div key={tierGroup.tier}>
                    {/* Tier label */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Sponsor cards */}
                    <div className={`grid gap-4 ${
                      tierGroup.tier === "presenting" ? "grid-cols-1" :
                      tierGroup.tier === "gold" ? "grid-cols-1 md:grid-cols-2" :
                      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                    }`}>
                      {tierGroup.sponsors.map((sponsor, sIdx) => (
                        <div
                          key={sponsor.name}
                          className={`group relative rounded-2xl border p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                            tierGroup.tier === "presenting"
                              ? "border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5 shadow-md"
                              : tierGroup.tier === "gold"
                                ? "border-accent/30 bg-card hover:border-accent/50"
                                : "border-border bg-card/70 hover:border-primary/20"
                          }`}
                          style={{
                            animationDelay: `${(tierIdx * 150) + (sIdx * 100)}ms`,
                            animation: "fade-in 0.5s ease-out both",
                          }}
                        >
                          {/* Sponsor initials circle */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm mb-3 transition-transform duration-300 group-hover:scale-110 ${
                            tierGroup.tier === "presenting" ? "bg-primary/15 text-primary" :
                            tierGroup.tier === "gold" ? "bg-accent/15 text-accent" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {sponsor.name.slice(0, 2).toUpperCase()}
                          </div>

                          <h4 className={`font-bold text-card-foreground ${
                            tierGroup.tier === "presenting" ? "text-lg" : "text-base"
                          }`}>
                            {sponsor.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{sponsor.subtitle}</p>

                          {/* Sponsor role */}
                          <div className="mt-3 pt-3 border-t border-border/60">
                            <p className="text-xs text-muted-foreground leading-relaxed">{sponsor.role}</p>
                          </div>

                          {/* Hover glow effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
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
          {active.cta && (
            <div className="mt-10 text-center py-10 bg-gradient-to-br from-primary/5 via-background/50 to-accent/5 border border-dashed border-primary/20 rounded-2xl">
              <span className="text-3xl block mb-3">{active.emoji}</span>
              <h3 className="text-xl font-black text-foreground mb-2">{active.cta.title}</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">{active.cta.subtitle}</p>
              <Button asChild>
                <Link to="/contact">Enquire →</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
