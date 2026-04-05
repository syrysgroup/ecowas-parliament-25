import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroIllustration from "@/components/shared/HeroIllustration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Heart, MapPin, Users, Calendar, Target,
  ShoppingBag, GraduationCap, Handshake, Quote, TrendingUp,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import FlagImg from "@/components/shared/FlagImg";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";

const Women = () => {
  const { t } = useTranslation();

  const streams = [
    { title: t("women.stream1.title"), desc: t("women.stream1.desc"), icon: <ShoppingBag className="h-6 w-6" /> },
    { title: t("women.stream2.title"), desc: t("women.stream2.desc"), icon: <GraduationCap className="h-6 w-6" /> },
    { title: t("women.stream3.title"), desc: t("women.stream3.desc"), icon: <Handshake className="h-6 w-6" /> },
  ];

  const stories = [
    { name: "Amina Diallo", country: "Senegal", business: "Shea Butter Cooperative", quote: "Through the ECOWAS platform, we connected with buyers in three new countries within our first year. Our cooperative now supports 120 women." },
    { name: "Grace Mensah", country: "Ghana", business: "TechSista Digital Agency", quote: "The mentorship programme gave me the confidence and skills to scale my agency from a one-woman operation to a team of fifteen." },
    { name: "Fatou Koroma", country: "Sierra Leone", business: "Freetown Textiles", quote: "Accessing cross-border markets used to feel impossible. The trade corridors initiative made it real — we now export to four ECOWAS countries." },
  ];

  const workshops = [
    { title: t("women.workshop1.title"), country: "Nigeria", date: "March 2026", topic: t("women.workshop1.topic") },
    { title: t("women.workshop2.title"), country: "Ghana", date: "April 2026", topic: t("women.workshop2.topic") },
    { title: t("women.workshop3.title"), country: "Côte d'Ivoire", date: "May 2026", topic: t("women.workshop3.topic") },
    { title: t("women.workshop4.title"), country: "Senegal", date: "June 2026", topic: t("women.workshop4.topic") },
    { title: t("women.workshop5.title"), country: "Togo", date: "July 2026", topic: t("women.workshop5.topic") },
    { title: t("women.workshop6.title"), country: "Sierra Leone", date: "Aug 2026", topic: t("women.workshop6.topic") },
  ];

  const metrics = [
    { value: "500+", label: t("women.metric1"), icon: <Users className="h-6 w-6" /> },
    { value: "150+", label: t("women.metric2"), icon: <TrendingUp className="h-6 w-6" /> },
    { value: "6", label: t("women.metric3"), icon: <MapPin className="h-6 w-6" /> },
    { value: "12", label: t("women.metric4"), icon: <Calendar className="h-6 w-6" /> },
  ];

  const countries = [
    { name: "Nigeria" }, { name: "Ghana" }, { name: "Côte d'Ivoire" },
    { name: "Senegal" }, { name: "Togo" }, { name: "Sierra Leone" },
  ];

  const objectives = [t("women.obj1"), t("women.obj2"), t("women.obj3"), t("women.obj4"), t("women.obj5")];

  return (
    <Layout>
      <ProgrammeSponsorMarquee sponsors={[{ name: "UNDP West Africa" }, { name: "Duchess International" }, { name: "ECOWAS Commission" }]} />
      <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
        <HeroIllustration theme="women" />
        <div className="container relative">
          <AnimatedSection>
            <Button asChild variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 mb-6 -ml-3">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.backToHome")}</Link>
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-secondary/20 text-secondary"><Heart className="h-6 w-6" /></div>
              <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">{t("common.programmePillar")}</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight whitespace-pre-line">{t("women.heroTitle")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("women.heroDesc")}</p>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <div className="flex flex-wrap gap-8 mt-10">
              {[
                { icon: <MapPin className="h-5 w-5" />, value: "6", label: t("women.countries") },
                { icon: <Users className="h-5 w-5" />, value: "500+", label: t("women.womenTarget") },
                { icon: <Calendar className="h-5 w-5" />, value: "12", label: t("women.workshops") },
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
        <h2 className="text-2xl font-bold text-foreground mb-4">{t("women.overviewTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed">{t("women.overviewText")}</p>
      </AnimatedSection></div></section>

      <section className="py-16 bg-muted/30"><div className="container">
        <AnimatedSection className="mb-10"><h2 className="text-2xl font-bold text-foreground">{t("women.streamsTitle")}</h2><p className="text-muted-foreground mt-1">{t("women.streamsDesc")}</p></AnimatedSection>
        <div className="grid md:grid-cols-3 gap-6">
          {streams.map((s, i) => (
            <AnimatedSection key={i} delay={i * 120}>
              <Card className="h-full group hover:shadow-lg transition-shadow duration-300 hover:border-secondary/40">
                <CardContent className="pt-6">
                  <div className="p-3 rounded-xl bg-secondary/10 text-secondary w-fit mb-4 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors duration-300">{s.icon}</div>
                  <h3 className="font-bold text-card-foreground text-lg mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div></section>

      <section className="py-16"><div className="container max-w-4xl">
        <AnimatedSection className="mb-10"><h2 className="text-2xl font-bold text-foreground">{t("women.voicesTitle")}</h2><p className="text-muted-foreground mt-1">{t("women.voicesDesc")}</p></AnimatedSection>
        <div className="space-y-6">
          {stories.map((s, i) => (
            <AnimatedSection key={i} delay={i * 120}>
              <div className="p-6 rounded-xl bg-card border border-border relative">
                <Quote className="h-8 w-8 text-secondary/20 absolute top-4 right-4" />
                <p className="text-muted-foreground italic mb-4 pr-10">"{s.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm">{s.name[0]}</div>
                  <div><p className="font-semibold text-card-foreground text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.business} · {s.country}</p></div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div></section>

      <section className="py-16 bg-muted/30"><div className="container max-w-3xl">
        <AnimatedSection className="mb-8"><h2 className="text-2xl font-bold text-foreground">{t("women.workshopCalendar")}</h2><p className="text-muted-foreground mt-1">{t("women.workshopCalendarDesc")}</p></AnimatedSection>
        <div className="space-y-3">
          {workshops.map((w, i) => (
            <AnimatedSection key={i} delay={i * 60}>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0"><Calendar className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground text-sm">{w.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{w.country} · {w.date}</p>
                  <p className="text-xs text-muted-foreground mt-1">{w.topic}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div></section>

      <section className="py-16"><div className="container">
        <AnimatedSection className="text-center mb-10"><h2 className="text-2xl font-bold text-foreground">{t("women.targets")}</h2></AnimatedSection>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <Card className="text-center hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-3">{m.icon}</div>
                  <p className="text-3xl font-black text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div></section>

      <section className="py-16 bg-muted/30"><div className="container">
        <AnimatedSection className="mb-8"><h2 className="text-2xl font-bold text-foreground">{t("women.participatingCountries")}</h2></AnimatedSection>
        <AnimatedSection delay={100}><div className="flex flex-wrap gap-3">
          {countries.map((c) => (<div key={c.name} className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border text-sm font-medium text-foreground"><FlagImg country={c.name} className="h-5 w-5" />{c.name}</div>))}
        </div></AnimatedSection>
      </div></section>

      <section className="py-16"><div className="container max-w-4xl">
        <AnimatedSection className="mb-8"><h2 className="text-2xl font-bold text-foreground">{t("women.objectivesTitle")}</h2></AnimatedSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {objectives.map((obj, i) => (<AnimatedSection key={i} delay={i * 80}><div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border"><Target className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">{obj}</p></div></AnimatedSection>))}
        </div>
      </div></section>

      <section className="py-20"><div className="container text-center"><AnimatedSection>
        <h2 className="text-3xl font-black text-foreground mb-4">{t("women.ctaTitle")}</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t("women.ctaDesc")}</p>
        <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">{t("women.ctaBtn")}</Button>
      </AnimatedSection></div></section>
      <ProgrammeSponsorsFooter tiers={[
        { label: "Programme Partners", sponsors: [{ name: "UNDP West Africa" }, { name: "Duchess International" }] },
        { label: "Institutional Partners", sponsors: [{ name: "ECOWAS Commission" }] },
      ]} />
    </Layout>
  );
};

export default Women;
