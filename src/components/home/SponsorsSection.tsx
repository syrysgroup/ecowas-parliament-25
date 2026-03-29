import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import naseniLogo from "@/assets/sponsors/naseni-logo.png";
import smedanLogo from "@/assets/sponsors/smedan-logo.png";
import providusLogo from "@/assets/sponsors/providus-logo.png";
import allianceLogo from "@/assets/sponsors/alliance-logo.png";

/* ─── Tier sizing ──────────────────────────────────────────────────────────── */
const TIER_CONFIG = {
  platinum: { size: 96, label: "Platinum", badge: "bg-amber-100 text-amber-900 border-amber-300", ring: "ring-amber-300/50" },
  gold:     { size: 80, label: "Gold",     badge: "bg-yellow-100 text-yellow-900 border-yellow-300", ring: "ring-yellow-300/40" },
  silver:   { size: 64, label: "Silver",   badge: "bg-gray-100 text-gray-700 border-gray-300", ring: "ring-gray-300/30" },
  supporter:{ size: 48, label: "Supporter",badge: "bg-primary/10 text-primary border-primary/20", ring: "ring-primary/20" },
} as const;

type Tier = keyof typeof TIER_CONFIG;

interface Sponsor {
  name: string;
  logo: string;
  tier: Tier;
}

interface ProgrammeSponsorGroup {
  programme: string;
  programmePath: string;
  color: string;
  sponsors: Sponsor[];
}

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const partners = [
  {
    name: "AWALCO",
    description: "Association of West African Legislative Correspondents — strategic partner for ECOWAS Parliament Initiatives.",
  },
];

const implementingPartners = [
  { name: "Duchess NL" },
  { name: "Borderless Trade & Investment" },
  { name: "CMD Tourism & Trade Enterprises" },
];

const programmeSponsorGroups: ProgrammeSponsorGroup[] = [
  {
    programme: "25th Anniversary Programme",
    programmePath: "/about",
    color: "border-l-primary",
    sponsors: [
      { name: "NASENI", logo: naseniLogo, tier: "gold" },
      { name: "SMEDAN", logo: smedanLogo, tier: "gold" },
      { name: "Providus Bank", logo: providusLogo, tier: "silver" },
      { name: "Alliance Economic Research and Ethics", logo: allianceLogo, tier: "silver" },
    ],
  },
];

const SponsorsSection = () => {
  return (
    <>
      {/* ─── Partners & Implementing Partners ─── */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Partners & Collaborators</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              Our <span className="text-primary">Partners</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Strategic partners and implementing organisations powering the ECOWAS Parliament Initiatives.
            </p>
          </AnimatedSection>

          {/* Strategic Partners */}
          <div className="flex justify-center mb-10">
            {partners.map((partner, i) => (
              <AnimatedSection key={partner.name} delay={i * 120}>
                <div className="p-8 rounded-2xl bg-card border-2 border-primary/20 shadow-lg max-w-md text-center hover:shadow-xl hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-ecowas-yellow to-secondary" />
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 mb-3">Strategic Partner</Badge>
                  <h3 className="font-black text-card-foreground text-2xl mb-3">{partner.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Implementing Partners */}
          <AnimatedSection className="text-center mb-4">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-3">Implementing Partners</Badge>
          </AnimatedSection>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {implementingPartners.map((p, i) => (
              <AnimatedSection key={p.name} delay={i * 100}>
                <div className="p-5 rounded-xl bg-card border border-border text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <span className="font-bold text-card-foreground text-sm">{p.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Programme-Scoped Sponsors ─── */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-muted/40 to-secondary/5 border-t border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <Badge className="bg-ecowas-yellow/10 text-ecowas-yellow border-ecowas-yellow/20 mb-3">Programme Sponsors</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              Sponsors & <span className="text-primary">Supporters</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Each sponsor is recognised under the specific programme they support.
            </p>
          </AnimatedSection>

          {programmeSponsorGroups.map((group) => (
            <div key={group.programme} className="mb-10 last:mb-0">
              <AnimatedSection>
                <div className={`border-l-4 ${group.color} pl-4 mb-6`}>
                  <h3 className="text-lg font-bold text-foreground">{group.programme}</h3>
                  <p className="text-sm text-muted-foreground">Sponsors for this initiative</p>
                </div>
              </AnimatedSection>

              {/* Tier groups */}
              {(["platinum", "gold", "silver", "supporter"] as Tier[]).map((tier) => {
                const tierSponsors = group.sponsors.filter(s => s.tier === tier);
                if (tierSponsors.length === 0) return null;
                const config = TIER_CONFIG[tier];

                return (
                  <div key={tier} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className={`${config.badge} text-xs`}>{config.label}</Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {tierSponsors.map((sponsor) => (
                        <AnimatedSection key={sponsor.name}>
                          <div className={`group flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-primary/30 ring-1 ${config.ring}`}>
                            <div
                              className="rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300 p-3"
                              style={{ width: config.size + 24, height: config.size + 24 }}
                            >
                              <img
                                src={sponsor.logo}
                                alt={sponsor.name}
                                loading="lazy"
                                style={{ width: config.size, height: config.size }}
                                className="object-contain"
                              />
                            </div>
                            <span className="text-base font-bold text-card-foreground text-center leading-tight">
                              {sponsor.name}
                            </span>
                          </div>
                        </AnimatedSection>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default SponsorsSection;
