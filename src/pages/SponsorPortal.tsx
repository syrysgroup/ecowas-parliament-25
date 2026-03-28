import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Globe, Mail, TrendingUp, Users, Video } from "lucide-react";
import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";

// ─── Why sponsor? bullets ─────────────────────────────────────────────────────
const whyPoints = [
  {
    title: "Reach 12 nations",
    desc: "The programme operates across all ECOWAS Parliament member states, giving sponsors unparalleled visibility in a bloc of 400 million people.",
  },
  {
    title: "Align with democracy & development",
    desc: "Associate your brand with ECOWAS Vision 2050 — youth empowerment, trade, gender equality, and civic engagement.",
  },
  {
    title: "Real ROI, fully measured",
    desc: "Every sponsor receives a dedicated impact dashboard with logo impressions, event placements, press mentions, and audience reach — updated monthly.",
  },
  {
    title: "Direct access to decision-makers",
    desc: "Flagship events bring together heads of delegation, parliamentarians, ministers, and senior UN officials from across West Africa.",
  },
  {
    title: "Co-branding across a full calendar year",
    desc: "40+ events, 12 months, 7 programme pillars. Your brand stays visible from the March launch to the December Gala.",
  },
  {
    title: "Media coverage and press amplification",
    desc: "All flagship events receive press coverage. Gold and Silver sponsors are cited in official press releases and media statements.",
  },
];

// ─── Tiers ────────────────────────────────────────────────────────────────────
const tiers = [
  {
    name: "Gold",
    tagline: "Lead partner visibility across the full programme",
    class: "border-amber-300 bg-amber-50/50",
    badgeClass: "bg-amber-100 text-amber-800",
    featured: true,
    benefits: [
      "Primary logo — website homepage & all 7 programme pages",
      "Speaking slot at minimum 3 flagship events",
      "Co-branded press releases for sponsored events",
      "Dedicated sponsor spotlight section on website",
      "Monthly impact report with full metrics",
      "VIP invitation — December Anniversary Gala",
      "Side event hosting opportunity (Trade Forum week)",
      "Quarterly Google Meet touchpoint with programme team",
      "Access to delegate lists (consented)",
      "Co-branded materials: banners, stage backdrop, lanyards",
    ],
  },
  {
    name: "Silver",
    tagline: "Programme-level partnership and event visibility",
    class: "border-slate-300",
    badgeClass: "bg-slate-100 text-slate-700",
    featured: false,
    benefits: [
      "Logo placement — 2 programme pages of your choice",
      "Speaking slot at 1 flagship event",
      "Named in programme materials and event collateral",
      "Quarterly impact report",
      "Invitation to December Anniversary Gala",
      "Bi-annual Google Meet touchpoint with programme team",
      "Co-branded materials for sponsored event",
    ],
  },
  {
    name: "Bronze",
    tagline: "Event presence and regional brand recognition",
    class: "border-orange-300 bg-orange-50/30",
    badgeClass: "bg-orange-100 text-orange-700",
    featured: false,
    benefits: [
      "Logo on 1 programme page (of your choice)",
      "Named in event collateral for 1 sponsored event",
      "Annual impact summary report",
      "Invitation to December Anniversary Gala",
    ],
  },
];

// ─── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: "400M+", label: "People in the ECOWAS bloc" },
  { value: "12",    label: "Member states reached" },
  { value: "40+",   label: "Events across 2026" },
  { value: "2.4M",  label: "Combined programme audience (est.)" },
];

// ─── Current sponsor logos ─────────────────────────────────────────────────────
const currentSponsors = [
  {
    name: "African Development Bank",
    tier: "Gold",
    tierClass: "bg-amber-100 text-amber-800",
  },
  {
    name: "European Union — ECOWAS Delegation",
    tier: "Gold",
    tierClass: "bg-amber-100 text-amber-800",
  },
  {
    name: "UNDP West Africa",
    tier: "Silver",
    tierClass: "bg-slate-100 text-slate-700",
  },
  {
    name: "UN Women — West Africa",
    tier: "Silver",
    tierClass: "bg-slate-100 text-slate-700",
  },
];

// ─── Implementing partners (from SponsorsSection pattern) ─────────────────────
const implementingPartners = [
  {
    name: "Duchess NL",
    lead: "Dr. Victoria Akai IIPM",
    role: "CEO",
    logo: duchessLogo,
    description: "Lead implementing partner coordinating the full year-long programme across all 12 ECOWAS Parliament member states.",
  },
  {
    name: "Borderless Trade & Investment",
    lead: "Dr. Olori Boye-Ajayi",
    role: "Managing Partner",
    logo: borderlessLogo,
    description: "Expertise in trade facilitation and regional economic integration across West Africa.",
  },
  {
    name: "CMD Tourism & Trade Enterprises",
    lead: "Blessing Okpale",
    role: "Lead",
    logo: cmdLogo,
    description: "Tourism and trade enterprise development, media production, and event management.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SponsorPortal() {
  return (
    <Layout>
      {/* Hero */}
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
              The ECOWAS Parliament 25th Anniversary Programme runs across all 12 member states throughout 2026 — 40+ events, 7 programme pillars, and a combined audience reach exceeding 2.4 million. Become part of history.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button variant="secondary" size="lg" className="gap-2">
                <Mail className="h-4 w-4" /> Express sponsorship interest
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
              >
                <Video className="h-4 w-4" /> Book a briefing call
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Impact stats */}
      <section className="py-12 border-b border-border bg-muted/30">
        <div className="container">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-black text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Why sponsor */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Why partner with the 25th Anniversary Programme?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              This is not a one-day gala. It is a year-long, multi-country programme that keeps your brand visible, relevant, and associated with West Africa's most important democratic institution.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyPoints.map((p, i) => (
              <AnimatedSection key={p.title} delay={i * 60}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="pt-5">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">{p.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Tier comparison */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Sponsorship tiers</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Three tiers of partnership — each with full visibility tracking and a dedicated team contact.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <AnimatedSection key={tier.name} delay={i * 80}>
                <Card className={`h-full border-2 ${tier.class} ${tier.featured ? "shadow-lg" : ""}`}>
                  {tier.featured && (
                    <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1.5 rounded-t-lg tracking-wide uppercase">
                      Most popular
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-black">{tier.name}</CardTitle>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.badgeClass}`}>
                        {tier.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5 mb-6">
                      {tier.benefits.map(b => (
                        <li key={b} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full gap-2 ${tier.featured ? "" : "variant-outline"}`}
                      variant={tier.featured ? "default" : "outline"}>
                      <Mail className="h-4 w-4" /> Enquire — {tier.name}
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Current sponsors showcase */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Current sponsors</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join these organisations already partnering with the ECOWAS Parliament 25th Anniversary Programme.
            </p>
          </AnimatedSection>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {currentSponsors.map(s => (
              <AnimatedSection key={s.name}>
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-card hover:shadow-md transition-all">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.tierClass}`}>{s.tier}</span>
                  <span className="text-sm font-medium text-card-foreground">{s.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Implementing partners */}
          <AnimatedSection className="mt-10">
            <div className="text-center mb-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">Programme Co-Organisers</Badge>
              <h3 className="text-xl font-bold">Implementing Partners</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {implementingPartners.map((p, i) => (
                <AnimatedSection key={p.name} delay={i * 100}>
                  <div className="relative p-6 rounded-xl bg-card border-2 border-primary/20 shadow-sm hover:shadow-lg transition-all group">
                    <Badge variant="outline" className="absolute top-3 right-3 text-[10px] border-primary/30 text-primary">
                      Co-Organiser
                    </Badge>
                    <img
                      src={p.logo}
                      alt={p.name}
                      className="h-12 w-auto mb-4 group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-bold text-card-foreground">{p.name}</h4>
                    <p className="text-sm text-primary font-medium mt-0.5">{p.lead} — {p.role}</p>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Impact reporting preview */}
      <section className="py-14 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <AnimatedSection>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Full visibility — tracked and reported</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Every sponsor receives a real-time dashboard showing exactly what their investment is delivering. No ambiguity. No end-of-year PDF guesswork. You see your reach as it grows.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Globe,     text: "Website logo impression tracking — updated monthly" },
                  { icon: Users,     text: "Event attendance data for every sponsored event"     },
                  { icon: TrendingUp,text: "Press mention tracking across regional media"        },
                  { icon: CheckCircle2,text:"Confirmation of all logo placements before publication"},
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.text} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <Card className="border-border shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold">Sample sponsor impact — Q1 2026</CardTitle>
                    <Badge>Gold</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Example metrics — your dashboard after go-live</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label:"Logo impressions", value:"47,200" },
                      { label:"Events featured",  value:"12"     },
                      { label:"Press mentions",   value:"8"      },
                      { label:"vs projection",    value:"+31%"   },
                    ].map(m => (
                      <div key={m.label} className="bg-muted/60 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-primary">{m.value}</p>
                        <p className="text-[11px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reports delivered monthly by your dedicated account manager. Quarterly touchpoint call included for all Gold + Silver sponsors.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-2xl text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-black mb-4">Ready to partner?</h2>
            <p className="text-muted-foreground mb-6">
              Contact our Sponsor Relations Manager to discuss the right tier for your organisation and receive a personalised visibility proposal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2">
                <Mail className="h-5 w-5" /> sponsors@ecowasparliament25.org
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Video className="h-5 w-5" /> Book a 30-min briefing call
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Mariama Camara — Sponsor Relations Manager · Responds within 48 hours
            </p>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
