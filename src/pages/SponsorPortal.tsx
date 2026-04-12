import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Globe,
  Mail,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
interface WhyPoint {
  title: string;
  desc: string;
}
interface Tier {
  name: string;
  tagline: string;
  class: string;
  badgeClass: string;
  featured: boolean;
  benefits: string[];
}
interface Stat {
  value: string;
  label: string;
}

// ─── Fallback stats ────────────────────────────────────────────────────────
const DEFAULT_STATS: Stat[] = [
  { value: "400M+", label: "People in the ECOWAS bloc" },
  { value: "12", label: "Member states reached" },
  { value: "40+", label: "Events across 2026" },
  { value: "2.4M", label: "Combined programme audience (est.)" },
];

export default function SponsorPortal() {
  // Sponsors
  const { data: currentSponsors = [] } = useQuery({
    queryKey: ["sponsors-public"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("sponsors")
        .select("id, name, slug, tier, logo_url")
        .eq("is_published", true)
        .order("sort_order");

      return (data ?? []) as {
        id: string;
        name: string;
        slug: string;
        tier: string;
        logo_url: string | null;
      }[];
    },
  });

  // Implementing partners
  const { data: implementingPartners = [] } = useQuery({
    queryKey: ["partners-public", "implementing"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partners")
        .select(
          "id, name, slug, logo_url, description, lead_name, lead_role"
        )
        .eq("partner_type", "implementing")
        .eq("is_published", true)
        .order("sort_order");

      return (data ?? []) as {
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        description: string | null;
        lead_name: string | null;
        lead_role: string | null;
      }[];
    },
  });

  // Stats
  const { data: statsContent } = useQuery({
    queryKey: ["site-content", "sponsor_portal_stats"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("site_content")
        .select("content")
        .eq("section_key", "sponsor_portal_stats")
        .maybeSingle();

      return data?.content as Record<string, string> | null;
    },
  });

  const stats: Stat[] = statsContent
    ? [
        {
          value: statsContent.stat1_value ?? DEFAULT_STATS[0].value,
          label: statsContent.stat1_label ?? DEFAULT_STATS[0].label,
        },
        {
          value: statsContent.stat2_value ?? DEFAULT_STATS[1].value,
          label: statsContent.stat2_label ?? DEFAULT_STATS[1].label,
        },
        {
          value: statsContent.stat3_value ?? DEFAULT_STATS[2].value,
          label: statsContent.stat3_label ?? DEFAULT_STATS[2].label,
        },
        {
          value: statsContent.stat4_value ?? DEFAULT_STATS[3].value,
          label: statsContent.stat4_label ?? DEFAULT_STATS[3].label,
        },
      ]
    : DEFAULT_STATS;

  const tierBadgeClass = (tier: string) => {
    const t = tier.toLowerCase();
    if (t === "gold" || t === "platinum")
      return "bg-amber-100 text-amber-800";
    if (t === "silver") return "bg-slate-100 text-slate-700";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <Layout>
      {/* HERO */}
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              Sponsor with us
            </Badge>

            <h1 className="text-4xl md:text-5xl font-black max-w-3xl">
              Partner with West Africa's Premier Parliamentary Anniversary
            </h1>

            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              The ECOWAS Parliament 25th Anniversary Programme runs across all
              12 member states throughout 2026 — 40+ events, 7 programme
              pillars, and a combined audience reach exceeding 2.4 million.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button variant="secondary" size="lg" className="gap-2">
                <Mail className="h-4 w-4" /> Express sponsorship interest
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="gap-2 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20"
              >
                <Video className="h-4 w-4" /> Book a briefing call
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="py-12 border-b border-border bg-muted/30">
        <div className="container">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl md:text-4xl font-black text-primary">
                    {s.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

{/* CURRENT SPONSORS (PREMIUM HIERARCHY DISPLAY) */}
<section className="py-16">
  <div className="container">
    <AnimatedSection className="text-center mb-12">
      <h2 className="text-2xl md:text-3xl font-bold">
        Current sponsors
      </h2>
    </AnimatedSection>

    {currentSponsors.length > 0 && (
      <>
        {/* ─── SORTING LOGIC ─── */}
        {(() => {
          const tierRank: Record<string, number> = {
            platinum: 0,
            gold: 1,
            silver: 2,
            bronze: 3,
          };

          const sorted = [...currentSponsors].sort(
            (a, b) =>
              (tierRank[a.tier.toLowerCase()] ?? 99) -
              (tierRank[b.tier.toLowerCase()] ?? 99)
          );

          const platinum = sorted.filter(
            (s) => s.tier.toLowerCase() === "platinum"
          );

          const others = sorted.filter(
            (s) => s.tier.toLowerCase() !== "platinum"
          );

          return (
            <>
              {/* ─── PLATINUM (SPOTLIGHT ROW) ─── */}
              {platinum.length > 0 && (
                <div className="mb-12">
                  <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-6">
                    Platinum Sponsors
                  </p>

                  <div className="flex flex-wrap justify-center gap-10">
                    {platinum.map((s, i) => (
                      <AnimatedSection key={s.id} delay={i * 80}>
                        <Link
                          to={`/sponsors/${s.slug}`}
                          className="
                            group flex items-center justify-center
                            transition-transform duration-300
                            hover:-translate-y-1
                          "
                        >
                          <div className="relative h-32 w-40 flex items-center justify-center">

                            {/* LOGO */}
                            {s.logo_url ? (
                              <img
                                src={s.logo_url}
                                alt={s.tier}
                                className="
                                  max-h-28
                                  max-w-full
                                  object-contain
                                  grayscale
                                  opacity-80
                                  transition-all duration-300
                                  group-hover:grayscale-0
                                  group-hover:opacity-100
                                  group-hover:scale-105
                                  drop-shadow-md
                                "
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-muted rounded-full" />
                            )}

                            {/* RIBBON */}
                            <span className="absolute top-0 right-0 text-[9px] font-semibold px-2 py-1 rounded-bl-md bg-purple-100 text-purple-700">
                              Platinum
                            </span>
                          </div>
                        </Link>
                      </AnimatedSection>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── OTHER TIERS (GRID) ─── */}
              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-3
                  lg:grid-cols-6
                  gap-x-4
                  gap-y-8
                  max-w-6xl
                  mx-auto
                  items-center
                  justify-items-center
                "
              >
                {others.map((s, i) => {
                  const tier = s.tier.toLowerCase();

                  const sizeClass =
                    tier === "gold"
                      ? "max-h-22"
                      : "max-h-16";

                  const badgeClass =
                    tier === "gold"
                      ? "bg-amber-100 text-amber-700"
                      : tier === "silver"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-orange-100 text-orange-700";

                  return (
                    <AnimatedSection key={s.id} delay={i * 60}>
                      <Link
                        to={`/sponsors/${s.slug}`}
                        className="
                          group flex items-center justify-center w-full
                          transition-transform duration-300
                          hover:-translate-y-1
                        "
                      >
                        <div className="relative h-28 w-full flex items-center justify-center px-3">

                          {/* LOGO */}
                          {s.logo_url ? (
                            <img
                              src={s.logo_url}
                              alt={s.tier}
                              className={`
                                ${sizeClass}
                                max-w-full
                                object-contain
                                grayscale
                                opacity-80
                                transition-all duration-300
                                group-hover:grayscale-0
                                group-hover:opacity-100
                                group-hover:scale-105
                              `}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-muted rounded-full" />
                          )}

                          {/* RIBBON */}
                          <span
                            className={`
                              absolute top-0 right-0
                              text-[9px] font-semibold
                              px-2 py-1
                              rounded-bl-md
                              ${badgeClass}
                            `}
                          >
                            {s.tier}
                          </span>
                        </div>
                      </Link>
                    </AnimatedSection>
                  );
                })}
              </div>
            </>
          );
        })()}
      </>
    )}
  </div>
</section>

      {/* IMPLEMENTING PARTNERS (CENTERED COLOR LOGOS) */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              Implementing Partners
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {implementingPartners.map((p, i) => (
              <AnimatedSection key={p.id} delay={i * 80}>
                <Link to={`/partners/${p.slug}`}>
                  <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-all text-center">

                    {/* CENTERED COLOR LOGO */}
                    {p.logo_url && (
                      <div className="h-20 flex items-center justify-center mb-4">
                        <img
                          src={p.logo_url}
                          alt={p.name}
                          className="max-h-16 max-w-[200px] object-contain transition-all duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}

                    <h4 className="font-bold">{p.name}</h4>

                    {p.lead_name && (
                      <p className="text-sm text-primary mt-1">
                        {p.lead_name}
                        {p.lead_role && ` — ${p.lead_role}`}
                      </p>
                    )}

                    {p.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center max-w-2xl">
          <AnimatedSection>
            <h2 className="text-3xl font-black mb-4">
              Ready to partner?
            </h2>

            <p className="text-muted-foreground mb-6">
              Contact us to discuss sponsorship opportunities.
            </p>

            <Button size="lg" className="gap-2">
              <Mail className="h-5 w-5" /> Contact Sponsorship Team
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}