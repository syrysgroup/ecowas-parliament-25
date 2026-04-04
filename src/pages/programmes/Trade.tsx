import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroIllustration from "@/components/shared/HeroIllustration";
import SponsorLogoMarquee from "@/components/trade/SponsorLogoMarquee";
import TradeSponsorsFooter from "@/components/trade/TradeSponsorsFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, TrendingUp, MapPin, Users, Target, ArrowRight,
  Building, Handshake, Globe, Briefcase, ShoppingBag,
  Factory, Wheat, CheckCircle, Rocket, BarChart3, Scale,
  FileSearch, GraduationCap, Truck, UserCheck,
  ExternalLink, Zap, Award, Shield, Network, Calendar,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import FlagImg from "@/components/shared/FlagImg";

const Trade = () => {
  const { t } = useTranslation();

  const t2tSteps = [
    { step: "01", title: t("trade.t2t.step1.title"), desc: t("trade.t2t.step1.desc"), icon: <FileSearch className="h-6 w-6" /> },
    { step: "02", title: t("trade.t2t.step2.title"), desc: t("trade.t2t.step2.desc"), icon: <GraduationCap className="h-6 w-6" /> },
    { step: "03", title: t("trade.t2t.step3.title"), desc: t("trade.t2t.step3.desc"), icon: <Handshake className="h-6 w-6" /> },
  ];

  const coreComponents = [
    { title: t("trade.core.platforms.title"), desc: t("trade.core.platforms.desc"), icon: <Globe className="h-5 w-5" /> },
    { title: t("trade.core.women.title"), desc: t("trade.core.women.desc"), icon: <Users className="h-5 w-5" /> },
    { title: t("trade.core.corridor.title"), desc: t("trade.core.corridor.desc"), icon: <Truck className="h-5 w-5" /> },
    { title: t("trade.core.policy.title"), desc: t("trade.core.policy.desc"), icon: <Scale className="h-5 w-5" /> },
  ];

  const countries = [
    { name: "Nigeria", role: t("trade.country.ng") },
    { name: "Ghana", role: t("trade.country.gh") },
    { name: "Côte d'Ivoire", role: t("trade.country.ci") },
    { name: "Senegal", role: t("trade.country.sn") },
    { name: "Togo", role: t("trade.country.tg") },
    { name: "Cabo Verde", role: t("trade.country.cv") },
    { name: "Sierra Leone", role: t("trade.country.sl") },
  ];

  const challenges = [
    { title: t("trade.challenge1.title"), desc: t("trade.challenge1.desc"), icon: <Shield className="h-5 w-5" /> },
    { title: t("trade.challenge2.title"), desc: t("trade.challenge2.desc"), icon: <ShoppingBag className="h-5 w-5" /> },
    { title: t("trade.challenge3.title"), desc: t("trade.challenge3.desc"), icon: <Network className="h-5 w-5" /> },
    { title: t("trade.challenge4.title"), desc: t("trade.challenge4.desc"), icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const watmapSteps = [
    { title: t("trade.watmap.step1.title"), desc: t("trade.watmap.step1.desc") },
    { title: t("trade.watmap.step2.title"), desc: t("trade.watmap.step2.desc") },
    { title: t("trade.watmap.step3.title"), desc: t("trade.watmap.step3.desc") },
    { title: t("trade.watmap.step4.title"), desc: t("trade.watmap.step4.desc") },
  ];

  const marketTiers = [
    { title: t("trade.market.ecowas.title"), desc: t("trade.market.ecowas.desc"), badge: "ETLS" },
    { title: t("trade.market.african.title"), desc: t("trade.market.african.desc"), badge: "AfCFTA" },
    { title: t("trade.market.international.title"), desc: t("trade.market.international.desc"), badge: "Global" },
  ];

  const strategicValues = [
    { title: t("trade.value1.title"), desc: t("trade.value1.desc"), icon: <Zap className="h-5 w-5" /> },
    { title: t("trade.value2.title"), desc: t("trade.value2.desc"), icon: <Globe className="h-5 w-5" /> },
    { title: t("trade.value3.title"), desc: t("trade.value3.desc"), icon: <Building className="h-5 w-5" /> },
    { title: t("trade.value4.title"), desc: t("trade.value4.desc"), icon: <Rocket className="h-5 w-5" /> },
  ];

  const t2tPhases = [
    { step: "01", title: t("trade.phase1.title"), desc: t("trade.phase1.desc"), location: "Lagos · Abuja" },
    { step: "02", title: t("trade.phase2.title"), desc: t("trade.phase2.desc"), location: "Lagos · Abuja" },
    { step: "03", title: t("trade.phase3.title"), desc: t("trade.phase3.desc"), location: "Lagos · Abuja" },
  ];

  const personas = [
    { title: t("trade.persona.agri.title"), desc: t("trade.persona.agri.desc"), emoji: "🌾" },
    { title: t("trade.persona.ops.title"), desc: t("trade.persona.ops.desc"), emoji: "📋" },
    { title: t("trade.persona.ready.title"), desc: t("trade.persona.ready.desc"), emoji: "🤝" },
  ];

  const valueProps = [
    { title: t("trade.prop1.title"), desc: t("trade.prop1.desc"), icon: <Award className="h-5 w-5" /> },
    { title: t("trade.prop2.title"), desc: t("trade.prop2.desc"), icon: <TrendingUp className="h-5 w-5" /> },
    { title: t("trade.prop3.title"), desc: t("trade.prop3.desc"), icon: <Rocket className="h-5 w-5" /> },
  ];

  return (
    <Layout>
      {/* Sponsor Marquee */}
      <SponsorLogoMarquee />

      {/* Hero */}
      <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
        <HeroIllustration theme="trade" />
        <div className="container relative">
          <AnimatedSection>
            <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-6 -ml-3">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.backToHome")}</Link>
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary-foreground/10 text-primary-foreground"><TrendingUp className="h-6 w-6" /></div>
              <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">ECOWAS Parliament @25</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">{t("trade.heroTitle")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("trade.heroDesc")}</p>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <div className="flex flex-wrap gap-8 mt-10">
              {[
                { icon: <MapPin className="h-5 w-5" />, value: "7", label: t("trade.stat.countries") },
                { icon: <Users className="h-5 w-5" />, value: "200+", label: t("trade.stat.smes") },
                { icon: <Globe className="h-5 w-5" />, value: "3", label: t("trade.stat.tiers") },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-foreground/10">{s.icon}</div>
                  <div><p className="text-2xl font-black">{s.value}</p><p className="text-xs text-primary-foreground/50">{s.label}</p></div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Programme Overview */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <AnimatedSection>
            <Badge className="mb-4">Programme Overview</Badge>
            <h2 className="text-3xl font-black text-foreground mb-4">{t("trade.overview.title")}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">{t("trade.overview.text")}</p>
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Mission</p>
                  <p className="text-sm text-muted-foreground">{t("trade.overview.mission")}</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-accent">
                <CardContent className="pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent-foreground mb-1">Scope</p>
                  <p className="text-sm text-muted-foreground">{t("trade.overview.scope")}</p>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* T2T Programme */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Training-to-Transaction</Badge>
            <h2 className="text-3xl font-black text-foreground">{t("trade.t2t.title")}</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{t("trade.t2t.desc")}</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {t2tSteps.map((s, i) => (
              <AnimatedSection key={i} delay={i * 150}>
                <Card className="relative h-full group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl font-black text-primary/20">{s.step}</span>
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">{s.icon}</div>
                    </div>
                    <CardTitle className="text-lg">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{s.desc}</p></CardContent>
                  {i < 2 && <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 text-primary/30"><ArrowRight className="h-6 w-6" /></div>}
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Core Components */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-10">
            <Badge className="mb-3">Core Component</Badge>
            <h2 className="text-2xl font-bold text-foreground">{t("trade.core.title")}</h2>
            <p className="text-muted-foreground mt-1">{t("trade.core.desc")}</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreComponents.map((c, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <Card className="h-full group hover:border-primary/40 transition-colors duration-300">
                  <CardContent className="pt-6">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">{c.icon}</div>
                    <h3 className="font-bold text-foreground mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Geographic Reach */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <Badge variant="outline" className="mb-3">Geographic Reach</Badge>
            <h2 className="text-2xl font-bold text-foreground">{t("trade.geo.title")}</h2>
            <p className="text-muted-foreground mt-1">{t("trade.geo.desc")}</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {countries.map((c, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <Card className="hover:shadow-md transition-shadow duration-300 h-full">
                  <CardContent className="pt-6">
                    <span className="text-4xl mb-3 block">{c.flag}</span>
                    <p className="font-bold text-card-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.role}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Development Challenge */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <AnimatedSection className="mb-10">
            <Badge variant="destructive" className="mb-3">Development Challenge</Badge>
            <h2 className="text-2xl font-bold text-foreground">{t("trade.challenge.title")}</h2>
            <p className="text-muted-foreground mt-2 max-w-3xl">{t("trade.challenge.desc")}</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 gap-4">
            {challenges.map((ch, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="flex gap-4 p-5 rounded-xl bg-card border border-border">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive flex-shrink-0 h-fit">{ch.icon}</div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{ch.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{ch.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* WATMAP Solution — T2T Details */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <AnimatedSection className="text-center mb-12">
            <Badge className="mb-3">WATMAP Solution</Badge>
            <h2 className="text-2xl font-bold text-foreground">{t("trade.watmap.title")}</h2>
            <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">{t("trade.watmap.desc")}</p>
          </AnimatedSection>
          <div className="space-y-4">
            {watmapSteps.map((ws, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="flex gap-4 p-5 rounded-xl bg-card border border-border group hover:border-primary/30 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-black text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">{i + 1}</div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{ws.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{ws.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Market Access */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <AnimatedSection className="mb-10">
            <h2 className="text-2xl font-bold text-foreground">{t("trade.market.title")}</h2>
            <p className="text-muted-foreground mt-1">{t("trade.market.desc")}</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-5">
            {marketTiers.map((mt, i) => (
              <AnimatedSection key={i} delay={i * 120}>
                <Card className="h-full group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{mt.badge}</Badge>
                    <CardTitle className="text-lg">{mt.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{mt.desc}</p></CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={400}>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { title: t("trade.infra1.title"), desc: t("trade.infra1.desc"), icon: <Factory className="h-5 w-5" /> },
                { title: t("trade.infra2.title"), desc: t("trade.infra2.desc"), icon: <Truck className="h-5 w-5" /> },
                { title: t("trade.infra3.title"), desc: t("trade.infra3.desc"), icon: <Handshake className="h-5 w-5" /> },
              ].map((inf, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="text-primary flex-shrink-0">{inf.icon}</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{inf.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{inf.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Strategic Value to AfCFTA */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <Badge className="mb-3">Strategic Value</Badge>
            <h2 className="text-2xl font-bold text-foreground">{t("trade.strategic.title")}</h2>
            <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">{t("trade.strategic.desc")}</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {strategicValues.map((sv, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <Card className="h-full text-center group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">{sv.icon}</div>
                    <h3 className="font-bold text-card-foreground mb-2 text-sm">{sv.title}</h3>
                    <p className="text-xs text-muted-foreground">{sv.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Expected Impact */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">{t("trade.impact.title")}</h2>
            <p className="text-muted-foreground mt-1">{t("trade.impact.desc")}</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { value: "200+", label: t("trade.impact.smes") },
              { value: "7", label: t("trade.impact.countries") },
              { value: "↑", label: t("trade.impact.trade") },
              { value: "5+", label: t("trade.impact.chains") },
              { value: "50%+", label: t("trade.impact.womenYouth") },
            ].map((imp, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="text-center p-5 rounded-xl bg-card border border-border">
                  <p className="text-3xl font-black text-primary">{imp.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{imp.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* T2T Programme Structure */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <AnimatedSection className="text-center mb-4">
            <Badge variant="secondary" className="mb-3">T2T Programme</Badge>
            <h2 className="text-2xl font-bold text-foreground">{t("trade.t2tDetail.title")}</h2>
            <p className="text-muted-foreground mt-1">{t("trade.t2tDetail.desc")}</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap justify-center gap-6 mt-6 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{t("trade.t2tDetail.training")}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{t("trade.t2tDetail.transaction")}</span>
              </div>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {t2tPhases.map((p, i) => (
              <AnimatedSection key={i} delay={i * 150}>
                <Card className="relative h-full group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl font-black text-primary/20">{p.step}</span>
                    </div>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                    <Badge variant="outline" className="mt-3 text-xs">{p.location}</Badge>
                  </CardContent>
                  {i < 2 && <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 text-primary/30"><ArrowRight className="h-6 w-6" /></div>}
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Who It Is For */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">{t("trade.whoFor.title")}</h2>
            <p className="text-muted-foreground mt-1">{t("trade.whoFor.desc")}</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-5">
            {personas.map((p, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <Card className="text-center h-full hover:shadow-md transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <span className="text-4xl block mb-3">{p.emoji}</span>
                    <h3 className="font-bold text-card-foreground mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">{t("trade.valueProp.title")}</h2>
            <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">{t("trade.valueProp.desc")}</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-5">
            {valueProps.map((vp, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <Card className="h-full text-center group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 text-accent-foreground flex items-center justify-center mb-4 group-hover:bg-accent transition-colors duration-300">{vp.icon}</div>
                    <h3 className="font-bold text-card-foreground mb-2">{vp.title}</h3>
                    <p className="text-sm text-muted-foreground">{vp.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-black text-foreground mb-4">{t("trade.cta.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t("trade.cta.desc")}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href="https://www.t2tprogramme.com/" target="_blank" rel="noopener noreferrer">
                  {t("trade.cta.apply")} <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">{t("trade.cta.partner")}</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{t("trade.cta.training")}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Sponsor Footer */}
      <TradeSponsorsFooter />
    </Layout>
  );
};

export default Trade;
