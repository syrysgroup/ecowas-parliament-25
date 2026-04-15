import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Scale, Users, Shield, Globe, ExternalLink,
  ArrowRight, Calendar, Award, Landmark,
  Facebook, Twitter, Instagram, Linkedin, Youtube,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import parliamentHero from "@/assets/parliament-hero-clean.jpg";
import parliamentChamber from "@/assets/parliament-chamber.png";

// ─── Social icon map ──────────────────────────────────────────────────────────
const SOCIAL_ICONS = [
  { key: "social_facebook",  Icon: Facebook,  label: "Facebook"  },
  { key: "social_twitter",   Icon: Twitter,   label: "Twitter/X" },
  { key: "social_instagram", Icon: Instagram, label: "Instagram" },
  { key: "social_linkedin",  Icon: Linkedin,  label: "LinkedIn"  },
  { key: "social_youtube",   Icon: Youtube,   label: "YouTube"   },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: <Calendar className="h-7 w-7" />, value: "2000", label: "Year Founded", sub: "16 November 2000" },
  { icon: <Globe className="h-7 w-7" />,    value: "12",   label: "Member States", sub: "West African Nations" },
  { icon: <Users className="h-7 w-7" />,    value: "95",  label: "Parliamentary Seats", sub: "Representing the Region" },
];

// ─── Mandate pillars ──────────────────────────────────────────────────────────
const PILLARS = [
  { icon: Scale,    color: "bg-primary/10 text-primary",         titleKey: "mandate.pillar1Title", descKey: "mandate.pillar1Desc" },
  { icon: Users,    color: "bg-accent/10 text-accent",           titleKey: "mandate.pillar2Title", descKey: "mandate.pillar2Desc" },
  { icon: Shield,   color: "bg-secondary/10 text-secondary",     titleKey: "mandate.pillar3Title", descKey: "mandate.pillar3Desc" },
  { icon: Globe,    color: "bg-ecowas-blue/10 text-ecowas-blue", titleKey: "mandate.pillar4Title", descKey: "mandate.pillar4Desc" },
];

// ─── Parliamentary bodies ─────────────────────────────────────────────────────
const COMMITTEES = [
  { name: "Committee on Political Affairs, Peace & Security", icon: Shield },
  { name: "Committee on Trade, Customs & Free Movement", icon: Globe },
  { name: "Committee on Human Development & Civil Society", icon: Users },
  { name: "Committee on Finance & Audit", icon: Landmark },
  { name: "Committee on Gender & Women Development", icon: Award },
  { name: "Committee on Legal & Judicial Affairs", icon: Scale },
];

export default function EcowasParliament() {
  const { t } = useTranslation();
  const { get } = useSiteSettings();

  const socialLinks = SOCIAL_ICONS.map(s => ({ ...s, url: get(s.key, "") })).filter(s => s.url);
  const website = "www.parl.ecowas.int";

  return (
    <Layout>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[85vh] flex items-center">
        {/* Background image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${parliamentHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        <div className="relative z-10 container py-24 text-center">
          <AnimatedSection className="space-y-6 max-w-3xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 p-4 shadow-2xl">
                <img
                  src={ecowasLogo}
                  alt="ECOWAS Parliament"
                  className="h-24 w-24 object-contain"
                  loading="eager"
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
              ECOWAS Parliament
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light">
              The Voice of West Africa's People
            </p>

            {/* Founding badge */}
            <div className="flex justify-center">
              <Badge className="bg-ecowas-yellow/90 text-accent-foreground border-0 text-sm font-bold px-4 py-1.5">
                Founded 16 November 2000 · 25th Anniversary
              </Badge>
            </div>

            {/* Social media icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                {socialLinks.map(({ key, Icon, label, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}

            {/* Bold website */}
            <a
              href={`https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xl md:text-2xl font-black text-white tracking-wide hover:text-primary transition-colors duration-200 group"
            >
              <Globe className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              {website}
              <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100" />
            </a>
          </AnimatedSection>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── At a Glance ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/40 border-y border-border">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <Badge variant="outline" className="mb-3">At a Glance</Badge>
            <h2 className="text-2xl font-bold text-foreground">ECOWAS Parliament in Numbers</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {STATS.map((s, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <Card className="text-center hover:shadow-lg transition-shadow border-border">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                      {s.icon}
                    </div>
                    <p className="text-4xl font-black text-foreground mb-1">{s.value}</p>
                    <p className="font-bold text-foreground text-sm">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mandate & Vision ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            {/* Left: mandate text + blockquote */}
            <AnimatedSection className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20">Our Mandate</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                {t("mandate.title")}{" "}
                <span className="text-primary">{t("mandate.titleAccent")}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                {t("mandate.desc")}
              </p>
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={parliamentChamber}
                  alt="ECOWAS Parliament Chamber"
                  className="w-full aspect-[16/7] object-cover object-top rounded-2xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
                <p className="absolute bottom-3 left-4 text-white/70 text-xs italic">
                  ECOWAS Parliament — 25th Anniversary Ordinary Session, Abuja
                </p>
              </div>
              <blockquote className="border-l-4 border-primary pl-5 text-muted-foreground italic text-base leading-relaxed">
                "{t("mandate.quote")}"
              </blockquote>
              <p className="text-sm text-muted-foreground">— {t("mandate.quoteAttr")}</p>
            </AnimatedSection>

            {/* Right: four pillar cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {PILLARS.map((pillar, i) => (
                <AnimatedSection key={i} delay={i * 80}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border">
                    <CardContent className="pt-6">
                      <div className={`w-12 h-12 rounded-xl ${pillar.color} flex items-center justify-center mb-4`}>
                        <pillar.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-foreground mb-2 text-sm">{t(pillar.titleKey)}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t(pillar.descKey)}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Committees ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Parliamentary Structure</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Standing Committees</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Specialist committees that drive ECOWAS Parliament's legislative and oversight work across the region.
            </p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {COMMITTEES.map((c, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <c.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-card-foreground leading-snug">{c.name}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Youth Parliament CTA ─────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container">
          <AnimatedSection>
            <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-background to-accent/10 border border-border p-10 md:p-16 text-center space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20">Get Involved</Badge>
              <h2 className="text-2xl md:text-4xl font-black text-foreground max-w-2xl mx-auto leading-tight">
                Be a Part of the Future of West African Governance
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Join the Youth Parliament simulation, partner with ECOWAS Parliament Initiatives,
                or explore our programme pillars shaping the region.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/programmes/parliament">
                    Youth Parliament Simulation <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/sponsors">
                    Become a Partner
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="gap-2">
                  <Link to="/programmes/youth">
                    Explore All Programmes
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
