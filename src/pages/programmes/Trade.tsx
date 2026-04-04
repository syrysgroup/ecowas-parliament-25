import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroIllustration from "@/components/shared/HeroIllustration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, TrendingUp, MapPin, Users, Target, ArrowRight,
  Building, Handshake, Globe, Briefcase, ShoppingBag, Palette,
  Factory, Wheat, Monitor, UserCheck, Megaphone, Heart,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const Trade = () => {
  const { t } = useTranslation();

  const cities = [
    { city: "Abidjan", country: "Côte d'Ivoire", flag: "🇨🇮", date: "March 2026", focus: t("trade.city1.focus"), status: t("common.confirmed") },
    { city: "Accra", country: "Ghana", flag: "🇬🇭", date: "April 2026", focus: t("trade.city2.focus"), status: t("common.confirmed") },
    { city: "Lomé", country: "Togo", flag: "🇹🇬", date: "May 2026", focus: t("trade.city3.focus"), status: t("common.planning") },
    { city: "Freetown", country: "Sierra Leone", flag: "🇸🇱", date: "June 2026", focus: t("trade.city4.focus"), status: t("common.planning") },
    { city: "Lagos", country: "Nigeria", flag: "🇳🇬", date: "July 2026", focus: t("trade.city5.focus"), status: t("common.confirmed") },
  ];

  const corridors = [
    { route: "Abidjan — Accra", countries: "🇨🇮 → 🇬🇭", focus: t("trade.corridor1.focus"), color: "border-l-primary" },
    { route: "Lagos — Lomé", countries: "🇳🇬 → 🇹🇬", focus: t("trade.corridor2.focus"), color: "border-l-accent" },
    { route: "Freetown — Conakry", countries: "🇸🇱 → 🇬🇳", focus: t("trade.corridor3.focus"), color: "border-l-secondary" },
  ];

  const sectors = [
    { name: t("trade.sector.agriculture"), icon: <Wheat className="h-4 w-4" /> },
    { name: t("trade.sector.textiles"), icon: <ShoppingBag className="h-4 w-4" /> },
    { name: t("trade.sector.digital"), icon: <Monitor className="h-4 w-4" /> },
    { name: t("trade.sector.manufacturing"), icon: <Factory className="h-4 w-4" /> },
    { name: t("trade.sector.creative"), icon: <Palette className="h-4 w-4" /> },
  ];

  const personas = [
    { title: t("trade.persona1.title"), desc: t("trade.persona1.desc"), icon: <Briefcase className="h-6 w-6" /> },
    { title: t("trade.persona2.title"), desc: t("trade.persona2.desc"), icon: <Globe className="h-6 w-6" /> },
    { title: t("trade.persona3.title"), desc: t("trade.persona3.desc"), icon: <Building className="h-6 w-6" /> },
    { title: t("trade.persona4.title"), desc: t("trade.persona4.desc"), icon: <Heart className="h-6 w-6" /> },
  ];

  const matchmakingSteps = [
    { step: "1", title: t("trade.match1.title"), desc: t("trade.match1.desc") },
    { step: "2", title: t("trade.match2.title"), desc: t("trade.match2.desc") },
    { step: "3", title: t("trade.match3.title"), desc: t("trade.match3.desc") },
    { step: "4", title: t("trade.match4.title"), desc: t("trade.match4.desc") },
  ];

  const objectives = [t("trade.obj1"), t("trade.obj2"), t("trade.obj3"), t("trade.obj4"), t("trade.obj5")];

  return (
    <Layout>
      <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
        <HeroIllustration theme="trade" />
        <div className="container relative">
          <AnimatedSection>
            <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-6 -ml-3">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.backToHome")}</Link>
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary-foreground/10 text-primary-foreground"><TrendingUp className="h-6 w-6" /></div>
              <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">{t("common.programmePillar")}</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight whitespace-pre-line">{t("trade.heroTitle")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("trade.heroDesc")}</p>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <div className="flex flex-wrap gap-8 mt-10">
              {[
                { icon: <MapPin className="h-5 w-5" />, value: "5", label: t("trade.cities") },
                { icon: <Users className="h-5 w-5" />, value: "200+", label: t("trade.smeTarget") },
                { icon: <Handshake className="h-5 w-5" />, value: "3", label: t("trade.pilotCorridors") },
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

      <section className="py-16"><div className="container max-w-4xl"><AnimatedSection>
        <h2 className="text-2xl font-bold text-foreground mb-4">{t("trade.overviewTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed">{t("trade.overviewText")}</p>
      </AnimatedSection></div></section>

      <section className="py-16 bg-muted/30"><div className="container">
        <AnimatedSection className="mb-10"><h2 className="text-2xl font-bold text-foreground">{t("trade.forumCities")}</h2><p className="text-muted-foreground mt-1">{t("trade.forumCitiesDesc")}</p></AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((c, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <Card className="h-full group hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between"><span className="text-3xl">{c.flag}</span><Badge variant={c.status === t("common.confirmed") ? "default" : "secondary"} className="text-xs">{c.status}</Badge></div>
                  <CardTitle className="text-lg">{c.city}</CardTitle>
                  <p className="text-xs text-muted-foreground">{c.country} · {c.date}</p>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground"><span className="font-medium text-card-foreground">{t("common.focus")}:</span> {c.focus}</p></CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div></section>

      <section className="py-16"><div className="container max-w-4xl">
        <AnimatedSection className="text-center mb-10"><h2 className="text-2xl font-bold text-foreground">{t("trade.matchmaking")}</h2><p className="text-muted-foreground mt-1">{t("trade.matchmakingDesc")}</p></AnimatedSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {matchmakingSteps.map((m, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className="flex gap-4 p-5 rounded-xl bg-card border border-border group hover:border-primary/30 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-black text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">{m.step}</div>
                <div><h4 className="font-semibold text-card-foreground">{m.title}</h4><p className="text-sm text-muted-foreground mt-1">{m.desc}</p></div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div></section>

      <section className="py-16 bg-muted/30"><div className="container max-w-3xl">
        <AnimatedSection className="mb-8"><h2 className="text-2xl font-bold text-foreground">{t("trade.corridors")}</h2><p className="text-muted-foreground mt-1">{t("trade.corridorsDesc")}</p></AnimatedSection>
        <div className="space-y-4">
          {corridors.map((c, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className={`p-5 rounded-xl bg-card border border-border border-l-4 ${c.color}`}>
                <div className="flex items-center gap-3 mb-2"><span className="text-lg">{c.countries}</span><h4 className="font-bold text-card-foreground">{c.route}</h4></div>
                <p className="text-sm text-muted-foreground">{c.focus}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div></section>

      <section className="py-16"><div className="container">
        <AnimatedSection className="mb-8"><h2 className="text-2xl font-bold text-foreground">{t("trade.keySectors")}</h2></AnimatedSection>
        <AnimatedSection delay={100}><div className="flex flex-wrap gap-3">
          {sectors.map((s, i) => (<div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:border-primary/40 transition-colors duration-300"><span className="text-primary">{s.icon}</span>{s.name}</div>))}
        </div></AnimatedSection>
      </div></section>

      <section className="py-16 bg-muted/30"><div className="container">
        <AnimatedSection className="mb-10"><h2 className="text-2xl font-bold text-foreground">{t("trade.whoTitle")}</h2></AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((p, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <Card className="text-center h-full group hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">{p.icon}</div>
                  <h3 className="font-bold text-card-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div></section>

      <section className="py-16"><div className="container max-w-4xl">
        <AnimatedSection className="mb-8"><h2 className="text-2xl font-bold text-foreground">{t("trade.objectivesTitle")}</h2></AnimatedSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {objectives.map((obj, i) => (<AnimatedSection key={i} delay={i * 80}><div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border"><Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">{obj}</p></div></AnimatedSection>))}
        </div>
      </div></section>

      <section className="py-20"><div className="container text-center"><AnimatedSection>
        <h2 className="text-3xl font-black text-foreground mb-4">{t("trade.ctaTitle")}</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t("trade.ctaDesc")}</p>
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">{t("trade.ctaBtn")}</Button>
      </AnimatedSection></div></section>
    </Layout>
  );
};

export default Trade;
