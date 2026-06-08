import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  Globe2,
  Handshake,
  Mail,
  Megaphone,
  Send,
  TrendingUp,
  Users2,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
interface Stat {
  value: string;
  label: string;
}
interface WhyPoint {
  icon?: LucideIcon;
  title: string;
  desc: string;
}
interface TierDef {
  name: string;
  tagline: string;
  featured: boolean;
  benefits: string[];
}
interface ProgrammePillar {
  id: string;
  slug: string;
  emoji: string | null;
  color: string | null;
  title: string;
  description: string | null;
  route: string | null;
  display_order: number;
}

// ─── Fallback content ──────────────────────────────────────────────────────
const DEFAULT_STATS: Stat[] = [
  { value: "400M+", label: "People in the ECOWAS bloc" },
  { value: "12", label: "Member states reached" },
  { value: "40+", label: "Events across 2026" },
  { value: "2.4M", label: "Combined programme audience (est.)" },
];

const STAT_ICONS: LucideIcon[] = [Globe2, Users2, CalendarDays, Megaphone];

const WHY_FALLBACK: WhyPoint[] = [
  {
    icon: Globe2,
    title: "Reach 400M people",
    desc: "The ECOWAS bloc spans 12 nations and over 400 million people — one of the world's fastest-growing economic regions.",
  },
  {
    icon: Users2,
    title: "Align with democracy",
    desc: "Associate your brand with the 25-year milestone of West Africa's parliamentary democracy. A story the world is watching.",
  },
  {
    icon: BarChart3,
    title: "Measurable ROI",
    desc: "Logo impressions, press mentions, delegate engagements, and audience reach — tracked and reported to you quarterly.",
  },
  {
    icon: Handshake,
    title: "Direct stakeholder access",
    desc: "VIP access to ministers, heads of state delegations, and business leaders across all 12 member countries.",
  },
  {
    icon: TrendingUp,
    title: "Year-round co-branding",
    desc: "40+ events across 2026 means continuous brand presence, not a single-day placement.",
  },
  {
    icon: Megaphone,
    title: "Pan-African media coverage",
    desc: "Print, broadcast, and digital coverage across the ECOWAS region amplifies your partnership to millions.",
  },
];

const TIER_FALLBACK: TierDef[] = [
  {
    name: "Gold",
    tagline: "Lead partner visibility across the full programme",
    featured: true,
    benefits: [
      "Logo on all event materials and digital channels",
      "4 VIP delegate passes per event",
      "Co-branded social media campaigns",
      "Named in all press releases",
      "End-of-year impact and visibility report",
    ],
  },
  {
    name: "Silver",
    tagline: "Programme-level partnership and event visibility",
    featured: false,
    benefits: [
      "Programme-specific logo placement",
      "2 delegate passes per event",
      "Social media acknowledgement",
      "Digital brand presence across the programme",
    ],
  },
  {
    name: "Bronze",
    tagline: "Event presence and regional brand recognition",
    featured: false,
    benefits: [
      "Event-level logo placement",
      "1 delegate pass per event",
      "Social media mention",
    ],
  },
];

const TIERS = [
  "presenting",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "standard",
] as const;

// ─── Component ────────────────────────────────────────────────────────────
export default function SponsorPortal() {
  // ─── Briefing call state ──────────────────────────────────────────────
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [briefingPending, setBriefingPending] = useState(false);
  const [briefingSubmitted, setBriefingSubmitted] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);
  const [briefingForm, setBriefingForm] = useState({
    contact_name: "",
    org_name: "",
    email: "",
    phone: "",
    preferred_time: "",
    notes: "",
  });

  // ─── Inquiry form state ───────────────────────────────────────────────
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

  // ─── Queries ──────────────────────────────────────────────────────────
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

  const { data: whyContent } = useQuery({
    queryKey: ["site-content", "sponsor_portal_why"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "sponsor_portal_why")
        .maybeSingle();
      return data?.content as { items?: { title: string; desc: string }[] } | null;
    },
  });

  const { data: tiersContent } = useQuery({
    queryKey: ["site-content", "sponsor_portal_tiers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "sponsor_portal_tiers")
        .maybeSingle();
      return data?.content as { tiers?: TierDef[] } | null;
    },
  });

  const { data: implementingPartners = [] } = useQuery({
    queryKey: ["partners-public", "implementing"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners")
        .select("id, name, slug, logo_url, description, lead_name, lead_role")
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

  const { data: pillars = [], isLoading: pillarsLoading } = useQuery<ProgrammePillar[]>({
    queryKey: ["programme-pillars-sponsor-page"],
    queryFn: async () => {
      const { data } = await supabase
        .from("programme_pillars")
        .select("id, slug, emoji, color, title, description, route, display_order")
        .order("display_order");
      return (data ?? []) as ProgrammePillar[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ─── Derived content ──────────────────────────────────────────────────
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

  const whyPoints: WhyPoint[] = whyContent?.items
    ? whyContent.items.map((item, i) => ({
        ...item,
        icon: WHY_FALLBACK[i]?.icon,
      }))
    : WHY_FALLBACK;

  const tiers: TierDef[] = tiersContent?.tiers ?? TIER_FALLBACK;

  // ─── Handlers ─────────────────────────────────────────────────────────
  const toggleProgramme = (slug: string, checked: boolean) => {
    setSelectedProgrammes((prev) =>
      checked ? [...prev, slug] : prev.filter((s) => s !== slug)
    );
  };

  const handleRequestConceptNote = (pillar: ProgrammePillar) => {
    setSelectedProgrammes([pillar.slug]);
    setForm((f) => ({
      ...f,
      message: `Please send me the concept note for the ${pillar.title} programme.`,
    }));
    document.getElementById("sponsor-inquiry")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEnquireTier = (tierName: string) => {
    setForm((f) => ({ ...f, preferred_tier: tierName.toLowerCase() }));
    document.getElementById("sponsor-inquiry")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBriefingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBriefingPending(true);
    setBriefingError(null);
    try {
      const { error } = await supabase.from("sponsor_inquiries").insert({
        org_name: briefingForm.org_name,
        contact_name: briefingForm.contact_name,
        email: briefingForm.email,
        phone: briefingForm.phone,
        message: briefingForm.notes
          ? `Preferred time: ${briefingForm.preferred_time}\n\n${briefingForm.notes}`
          : `Preferred time: ${briefingForm.preferred_time}`,
        programmes: [],
        request_type: "briefing_call",
      });
      if (error) throw error;
      setBriefingSubmitted(true);
    } catch (err: any) {
      setBriefingError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setBriefingPending(false);
    }
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
        request_type: "inquiry",
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
      {/* ── BRIEFING CALL DIALOG ─────────────────────────────────────────── */}
      <Dialog open={briefingOpen} onOpenChange={setBriefingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book a briefing call</DialogTitle>
            <DialogDescription>
              Leave your details and our Sponsor Relations team will confirm a time
              within 24 hours. All information is handled confidentially.
            </DialogDescription>
          </DialogHeader>

          {briefingSubmitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <p className="font-semibold text-lg">We'll be in touch within 24 hours.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Our team will review your details and confirm a time.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => {
                  setBriefingOpen(false);
                  setBriefingSubmitted(false);
                  setBriefingForm({
                    contact_name: "",
                    org_name: "",
                    email: "",
                    phone: "",
                    preferred_time: "",
                    notes: "",
                  });
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBriefingSubmit} className="space-y-4 mt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bc_contact">Your name *</Label>
                  <Input
                    id="bc_contact"
                    required
                    value={briefingForm.contact_name}
                    onChange={(e) =>
                      setBriefingForm((f) => ({ ...f, contact_name: e.target.value }))
                    }
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bc_org">Organisation *</Label>
                  <Input
                    id="bc_org"
                    required
                    value={briefingForm.org_name}
                    onChange={(e) =>
                      setBriefingForm((f) => ({ ...f, org_name: e.target.value }))
                    }
                    placeholder="Company or org name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bc_email">Email *</Label>
                  <Input
                    id="bc_email"
                    type="email"
                    required
                    value={briefingForm.email}
                    onChange={(e) =>
                      setBriefingForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="you@org.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bc_phone">Phone *</Label>
                  <Input
                    id="bc_phone"
                    type="tel"
                    required
                    value={briefingForm.phone}
                    onChange={(e) =>
                      setBriefingForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+234 000 0000"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bc_time">Preferred time *</Label>
                <Input
                  id="bc_time"
                  required
                  value={briefingForm.preferred_time}
                  onChange={(e) =>
                    setBriefingForm((f) => ({ ...f, preferred_time: e.target.value }))
                  }
                  placeholder="e.g. Mornings this week, Thursday after 2pm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bc_notes">
                  What would you like to discuss? (optional)
                </Label>
                <Textarea
                  id="bc_notes"
                  rows={3}
                  value={briefingForm.notes}
                  onChange={(e) =>
                    setBriefingForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Specific programmes, tier interest, partnership goals…"
                  className="resize-none"
                />
              </div>
              {briefingError && (
                <p className="text-sm text-destructive">{briefingError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your details are used solely to prepare for this call and will not be
                shared with third parties.
              </p>
              <Button
                type="submit"
                disabled={briefingPending}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {briefingPending ? "Sending…" : "Request call"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-hero text-primary-foreground py-24 relative overflow-hidden">
        {/* subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        <div className="container relative">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-4">
              25th Anniversary · 2026
            </Badge>

            <h1 className="text-4xl md:text-6xl font-black max-w-4xl leading-tight">
              Be part of the movement shaping{" "}
              <span className="text-primary-foreground/80">West Africa's</span> future
            </h1>

            <p className="mt-5 text-lg md:text-xl text-primary-foreground/70 max-w-2xl leading-relaxed">
              The ECOWAS Parliament celebrates 25 years of democracy across 12 nations in
              2026 — 40+ events, 7 programme pillars, and an audience reach exceeding{" "}
              <strong className="text-primary-foreground">2.4 million people</strong>.
              This is your opportunity to be on the right side of history.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Button variant="secondary" size="lg" className="gap-2 text-base px-6" asChild>
                <a href="#sponsor-inquiry">
                  <Mail className="h-5 w-5" /> Express sponsorship interest
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-base px-6 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20"
                onClick={() => setBriefingOpen(true)}
              >
                <Video className="h-5 w-5" /> Book a briefing call
              </Button>
            </div>

            <p className="mt-4 text-sm text-primary-foreground/50">
              Our Sponsor Relations team responds within 48 hours.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── IMPACT STATS ─────────────────────────────────────────────────────── */}
      <section className="py-14 border-b border-border bg-muted/30">
        <div className="container">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s, i) => {
                const Icon = STAT_ICONS[i];
                return (
                  <div key={s.label} className="space-y-1">
                    {Icon && (
                      <div className="flex justify-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    )}
                    <p className="text-3xl md:text-4xl font-black text-primary">
                      {s.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── WHY PARTNER ──────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Why partner with us</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">
              The opportunity is unlike any other
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              A 25-year milestone in West African democracy doesn't happen often. Here's
              why leading organisations are choosing to be part of it.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <AnimatedSection key={point.title} delay={i * 60}>
                  <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow h-full">
                    {Icon && (
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <h3 className="font-bold text-base mb-2">{point.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {point.desc}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROGRAMME PILLARS ────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border bg-muted/20">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="outline" className="mb-3">7 programme pillars</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">
              Choose where your impact lands
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Each pillar runs its own events, builds its own audience, and has a
              dedicated team. Direct your sponsorship to one or several.
            </p>
          </AnimatedSection>

          {pillarsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pillars.map((pillar, i) => (
                <AnimatedSection key={pillar.id} delay={i * 60}>
                  <Card className="h-full hover:shadow-lg transition-shadow flex flex-col rounded-2xl">
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
                    <CardContent className="flex flex-col flex-1">
                      {pillar.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                          {pillar.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1.5"
                          onClick={() => handleRequestConceptNote(pillar)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Request concept note
                        </Button>
                        {pillar.route && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs gap-1.5"
                            asChild
                          >
                            <Link to={pillar.route}>
                              <ArrowRight className="h-3.5 w-3.5" />
                              More information
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SPONSORSHIP TIERS ────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Sponsorship tiers</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">
              Find the right level of partnership
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Every tier delivers real visibility. Higher tiers unlock exclusive access,
              co-branding rights, and direct stakeholder engagement.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <AnimatedSection key={tier.name} delay={i * 80}>
                <div
                  className={`relative rounded-2xl border p-7 flex flex-col h-full transition-shadow hover:shadow-xl ${
                    tier.featured
                      ? "bg-card border-primary shadow-lg"
                      : "bg-muted/40 border-border"
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3
                      className={`text-xl font-black ${
                        tier.featured ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {tier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{tier.tagline}</p>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            tier.featured ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleEnquireTier(tier.name)}
                    variant={tier.featured ? "default" : "outline"}
                    className="w-full"
                  >
                    Enquire about {tier.name}
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Presenting and Platinum packages are available for flagship-level partners.{" "}
            <button
              onClick={() => setBriefingOpen(true)}
              className="underline hover:text-foreground transition-colors"
            >
              Book a briefing call
            </button>{" "}
            to discuss bespoke arrangements.
          </p>
        </div>
      </section>

      {/* ── IMPLEMENTING PARTNERS ────────────────────────────────────────────── */}
      {implementingPartners.length > 0 && (
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="container">
            <AnimatedSection className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">Implementing Partners</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
                Organisations working alongside ECOWAS Parliament to deliver the programme
                on the ground.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {implementingPartners.map((p, i) => (
                <AnimatedSection key={p.id} delay={i * 80}>
                  <Link to={`/partners/${p.slug}`}>
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all text-center">
                      {p.logo_url && (
                        <div className="h-20 flex items-center justify-center mb-4">
                          <img
                            src={p.logo_url}
                            alt={p.name}
                            className="max-h-16 max-w-[200px] object-contain"
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
      )}

      {/* ── SPONSOR INQUIRY FORM ─────────────────────────────────────────────── */}
      <section id="sponsor-inquiry" className="py-20 scroll-mt-16">
        <div className="container max-w-3xl">
          <AnimatedSection className="text-center mb-10">
            <Badge variant="outline" className="mb-3">Ready to partner?</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Express your interest</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Fill in the form below and our Sponsor Relations team will reach out within
              48 hours with a personalised proposal.
            </p>
          </AnimatedSection>

          {formSubmitted ? (
            <AnimatedSection className="text-center py-14">
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
              {/* Row 1 */}
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

              {/* Row 2 */}
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

              {/* Row 3 */}
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
              <div className="space-y-2">
                <Label>Programmes of interest</Label>
                <p className="text-xs text-muted-foreground">
                  Select all that apply — or choose General to indicate broad interest.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  <label
                    className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/40 cursor-pointer transition-colors sm:col-span-2"
                    style={
                      selectedProgrammes.includes("general")
                        ? {
                            borderColor: "hsl(var(--primary) / 0.4)",
                            background: "hsl(var(--primary) / 0.04)",
                          }
                        : undefined
                    }
                  >
                    <Checkbox
                      checked={selectedProgrammes.includes("general")}
                      onCheckedChange={(checked) =>
                        toggleProgramme("general", !!checked)
                      }
                    />
                    <span className="text-sm leading-snug font-medium">
                      🌍 General — interested in all programmes
                    </span>
                  </label>

                  {pillars.map((pillar) => (
                    <label
                      key={pillar.id}
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/40 cursor-pointer transition-colors"
                      style={
                        selectedProgrammes.includes(pillar.slug)
                          ? {
                              borderColor: "hsl(var(--primary) / 0.4)",
                              background: "hsl(var(--primary) / 0.04)",
                            }
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
