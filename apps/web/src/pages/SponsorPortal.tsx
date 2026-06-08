import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Globe,
  Mail,
  Send,
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
interface ProgrammePillar {
  id: string;
  slug: string;
  emoji: string | null;
  color: string | null;
  title: string;
  description: string | null;
  sponsors: string[] | null;
  progress_percent: number | null;
  display_order: number;
}

// ─── Fallback stats ────────────────────────────────────────────────────────
const DEFAULT_STATS: Stat[] = [
  { value: "400M+", label: "People in the ECOWAS bloc" },
  { value: "12", label: "Member states reached" },
  { value: "40+", label: "Events across 2026" },
  { value: "2.4M", label: "Combined programme audience (est.)" },
];

const TIERS = [
  "presenting",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "standard",
] as const;

export default function SponsorPortal() {
  // ─── Form state ───────────────────────────────────────────────────────────
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formPending, setFormPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedProgrammes, setSelectedProgrammes] = useState<string[]>([]);
  const [form, setForm] = useState({
    org_name: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    preferred_tier: "",
    message: "",
  });

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: currentSponsors = [] } = useQuery({
    queryKey: ["sponsors-public"],
    queryFn: async () => {
      const { data } = await supabase
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

  const { data: implementingPartners = [] } = useQuery({
    queryKey: ["partners-public", "implementing"],
    queryFn: async () => {
      const { data } = await supabase
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

  const { data: statsContent } = useQuery({
    queryKey: ["site-content", "sponsor_portal_stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "sponsor_portal_stats")
        .maybeSingle();

      return data?.content as Record<string, string> | null;
    },
  });

  const { data: pillars = [], isLoading: pillarsLoading } = useQuery<ProgrammePillar[]>({
    queryKey: ["programme-pillars-sponsor-page"],
    queryFn: async () => {
      const { data } = await supabase
        .from("programme_pillars")
        .select(
          "id, slug, emoji, color, title, description, sponsors, progress_percent, display_order"
        )
        .eq("is_active", true)
        .order("display_order");
      return (data ?? []) as ProgrammePillar[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ─── Derived ──────────────────────────────────────────────────────────────
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

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const toggleProgramme = (slug: string, checked: boolean) => {
    setSelectedProgrammes((prev) =>
      checked ? [...prev, slug] : prev.filter((s) => s !== slug)
    );
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormPending(true);
    try {
      const { error } = await supabase.from("sponsor_inquiries").insert({
        org_name: form.org_name,
        contact_name: form.contact_name,
        email: form.email,
        phone: form.phone || null,
        website: form.website || null,
        programmes: selectedProgrammes,
        preferred_tier: form.preferred_tier || null,
        message: form.message,
      });
      if (error) throw error;
      setFormSubmitted(true);
    } catch (err: any) {
      setFormError(
        err?.message ?? "Something went wrong. Please try again or email us directly."
      );
    } finally {
      setFormPending(false);
    }
  };

  const resetForm = () => {
    setFormSubmitted(false);
    setFormError(null);
    setForm({
      org_name: "",
      contact_name: "",
      email: "",
      phone: "",
      website: "",
      preferred_tier: "",
      message: "",
    });
    setSelectedProgrammes([]);
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
              The ECOWAS Parliament Initiatives 25th Anniversary Programme runs across all
              12 member states throughout 2026, 40+ events, 7 programme
              pillars, and a combined audience reach exceeding 2.4 million.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button variant="secondary" size="lg" className="gap-2" asChild>
                <a href="#sponsor-inquiry">
                  <Mail className="h-4 w-4" /> Express sponsorship interest
                </a>
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

      {/* PROGRAMME PILLARS */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              Programmes you'd be supporting
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Each programme pillar runs its own events, builds its own audience, and has a
              dedicated team. Your sponsorship can be directed to one or several.
            </p>
          </AnimatedSection>

          {pillarsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pillars.map((pillar, i) => {
                const sponsorCount = pillar.sponsors?.length ?? 0;
                return (
                  <AnimatedSection key={pillar.id} delay={i * 60}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          {pillar.emoji && (
                            <span className="text-3xl" role="img" aria-hidden>
                              {pillar.emoji}
                            </span>
                          )}
                          <CardTitle className="text-base leading-snug">
                            {pillar.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {pillar.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {pillar.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {sponsorCount === 1
                              ? "1 current sponsor"
                              : `${sponsorCount} current sponsors`}
                          </span>
                          {pillar.progress_percent != null && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {pillar.progress_percent}%
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
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
                          Sponsors
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
                          tier === "gold" ? "max-h-22" : "max-h-16";

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
                        {p.lead_role && `, ${p.lead_role}`}
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

      {/* SPONSOR INQUIRY FORM */}
      <section id="sponsor-inquiry" className="py-16 border-t border-border scroll-mt-16">
        <div className="container max-w-3xl">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              Express your interest
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Fill in the form below and our Sponsor Relations team will reach out within
              48 hours with a personalised proposal.
            </p>
          </AnimatedSection>

          {formSubmitted ? (
            <AnimatedSection className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Enquiry received</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Thank you for your interest. A member of our Sponsor Relations team will
                contact you within 48 hours.
              </p>
              <Button variant="outline" className="mt-6" onClick={resetForm}>
                Submit another enquiry
              </Button>
            </AnimatedSection>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-6">
              {/* Row 1: Org + Contact */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inq_org_name">Organisation name *</Label>
                  <Input
                    id="inq_org_name"
                    required
                    value={form.org_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, org_name: e.target.value }))
                    }
                    placeholder="Your organisation or company name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inq_contact_name">Contact name *</Label>
                  <Input
                    id="inq_contact_name"
                    required
                    value={form.contact_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contact_name: e.target.value }))
                    }
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Row 2: Email + Phone */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inq_email">Email address *</Label>
                  <Input
                    id="inq_email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="you@organisation.org"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inq_phone">Phone (optional)</Label>
                  <Input
                    id="inq_phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+234 000 0000 000"
                  />
                </div>
              </div>

              {/* Row 3: Website + Tier */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inq_website">Website (optional)</Label>
                  <Input
                    id="inq_website"
                    type="url"
                    value={form.website}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, website: e.target.value }))
                    }
                    placeholder="https://your-organisation.org"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Preferred sponsorship tier (optional)</Label>
                  <Select
                    value={form.preferred_tier}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, preferred_tier: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tier…" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIERS.map((tier) => (
                        <SelectItem key={tier} value={tier} className="capitalize">
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Programme checkboxes */}
              {pillars.length > 0 && (
                <div className="space-y-2">
                  <Label>Programmes of interest</Label>
                  <p className="text-xs text-muted-foreground">
                    Select all that apply — or leave blank to indicate interest across
                    the full programme.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {pillars.map((pillar) => (
                      <label
                        key={pillar.id}
                        className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/40 cursor-pointer transition-colors"
                        style={
                          selectedProgrammes.includes(pillar.slug)
                            ? { borderColor: "hsl(var(--primary) / 0.4)", background: "hsl(var(--primary) / 0.04)" }
                            : undefined
                        }
                      >
                        <Checkbox
                          checked={selectedProgrammes.includes(pillar.slug)}
                          onCheckedChange={(checked) =>
                            toggleProgramme(pillar.slug, !!checked)
                          }
                        />
                        <span className="text-sm leading-snug">
                          {pillar.emoji && (
                            <span className="mr-1.5">{pillar.emoji}</span>
                          )}
                          {pillar.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="space-y-1.5">
                <Label htmlFor="inq_message">Why do you want to partner? *</Label>
                <Textarea
                  id="inq_message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Tell us about your organisation, your goals for this partnership, and any specific events or programmes you have in mind."
                  className="resize-none"
                />
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <p className="text-xs text-muted-foreground">
                Your information will only be used to respond to this enquiry and will
                not be shared with third parties.
              </p>

              <Button
                type="submit"
                disabled={formPending}
                size="lg"
                className="w-full sm:w-auto gap-2"
              >
                <Send className="h-4 w-4" />
                {formPending ? "Submitting…" : "Submit enquiry"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
