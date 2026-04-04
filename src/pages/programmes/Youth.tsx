import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroIllustration from "@/components/shared/HeroIllustration";
import FlagImg from "@/components/shared/FlagImg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Lightbulb, Users, MapPin, Calendar, Target, Trophy,
  Cpu, Stethoscope, Landmark, Leaf, GraduationCap, ArrowRight, Rocket, Star,
  BrainCircuit, ArrowDown,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import parliament25Logo from "@/assets/parliament-25-logo.png";

const Youth = () => {
  const { t } = useTranslation();
  const detailsRef = useRef<HTMLDivElement>(null);

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const phases = [
    { step: "01", title: t("youth.phase1.title"), desc: t("youth.phase1.desc"), icon: <Rocket className="h-6 w-6" /> },
    { step: "02", title: t("youth.phase2.title"), desc: t("youth.phase2.desc"), icon: <Star className="h-6 w-6" /> },
    { step: "03", title: t("youth.phase3.title"), desc: t("youth.phase3.desc"), icon: <Trophy className="h-6 w-6" /> },
  ];

  const tracks = [
    { title: t("youth.track.agritech"), desc: t("youth.track.agritechDesc"), icon: <Leaf className="h-5 w-5" /> },
    { title: t("youth.track.healthtech"), desc: t("youth.track.healthtechDesc"), icon: <Stethoscope className="h-5 w-5" /> },
    { title: t("youth.track.fintech"), desc: t("youth.track.fintechDesc"), icon: <Landmark className="h-5 w-5" /> },
    { title: t("youth.track.cleanenergy"), desc: t("youth.track.cleanenergyDesc"), icon: <Lightbulb className="h-5 w-5" /> },
    { title: t("youth.track.edtech"), desc: t("youth.track.edtechDesc"), icon: <GraduationCap className="h-5 w-5" /> },
  ];

  const countries = [
    { name: "Nigeria", status: t("common.registering") },
    { name: "Ghana", status: t("common.registering") },
    { name: "Côte d'Ivoire", status: t("common.upcoming") },
    { name: "Senegal", status: t("common.upcoming") },
    { name: "Cabo Verde", status: t("common.upcoming") },
    { name: "Togo", status: t("common.upcoming") },
    { name: "Sierra Leone", status: t("common.upcoming") },
  ];

  const prizes = [
    { tier: t("youth.gold"), color: "bg-accent text-accent-foreground", amount: "$10,000", benefits: [t("youth.benefit.mentorship"), t("youth.benefit.incubation"), t("youth.benefit.policyPresentation")] },
    { tier: t("youth.silver"), color: "bg-muted text-foreground", amount: "$5,000", benefits: [t("youth.benefit.mentorship"), t("youth.benefit.networking"), t("youth.benefit.mediaFeature")] },
    { tier: t("youth.bronze"), color: "bg-secondary/20 text-secondary", amount: "$2,500", benefits: [t("youth.benefit.mentorship"), t("youth.benefit.certificate"), t("youth.benefit.alumni")] },
  ];

  const objectives = [t("youth.obj1"), t("youth.obj2"), t("youth.obj3"), t("youth.obj4"), t("youth.obj5")];

  return (
    <Layout>
      {/* Bold Split-Screen Landing */}
      <section className="relative min-h-[90vh] flex flex-col overflow-hidden">
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.backToHome")}</Link>
          </Button>
        </div>

        <div className="flex-1 grid md:grid-cols-2 relative">
          {/* Left: Innovators Challenge */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground min-h-[45vh] md:min-h-0">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, hsl(152 100% 40% / 0.3) 20px, hsl(152 100% 40% / 0.3) 21px)"
            }} />
            <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">{t("youth.innovatorsTitle")}</h2>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-8">
                {t("youth.innovatorsDesc")}
              </p>
              <Button
                onClick={scrollToDetails}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg"
              >
                {t("youth.learnMore")} <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right: Smart Challenge Quiz */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-bl from-accent via-accent/95 to-accent/80 text-accent-foreground min-h-[45vh] md:min-h-0">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 20px, hsl(50 87% 55% / 0.3) 20px, hsl(50 87% 55% / 0.3) 21px)"
            }} />
            <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-black/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">{t("youth.smartTitle")}</h2>
              <p className="text-accent-foreground/70 text-sm leading-relaxed mb-8">
                {t("youth.smartDesc")}
              </p>
              <Button
                onClick={scrollToDetails}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg"
              >
                {t("youth.learnMore")} <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Center: 25th Anniversary Logo overlapping the dividing line */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
            <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-white shadow-2xl flex items-center justify-center">
              <img
                src={parliament25Logo}
                alt="Parliament @25"
                className="h-28 lg:h-36 w-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Mobile center logo */}
          <div className="absolute left-1/2 top-[45vh] -translate-x-1/2 -translate-y-1/2 z-20 md:hidden">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-white shadow-2xl flex items-center justify-center">
              <img
                src={parliament25Logo}
                alt="Parliament @25"
                className="h-20 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed content below */}
      <div ref={detailsRef}>
        <section className="py-16">
          <div className="container max-w-4xl">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("youth.overviewTitle")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("youth.overviewText")}</p>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground">{t("youth.howItWorks")}</h2>
              <p className="text-muted-foreground mt-1">{t("youth.howItWorksDesc")}</p>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {phases.map((p, i) => (
                <AnimatedSection key={i} delay={i * 150}>
                  <Card className="relative border-border h-full group hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl font-black text-accent/30">{p.step}</span>
                        <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">{p.icon}</div>
                      </div>
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{p.desc}</p></CardContent>
                    {i < 2 && (<div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 text-accent/40"><ArrowRight className="h-6 w-6" /></div>)}
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <AnimatedSection className="mb-10">
              <h2 className="text-2xl font-bold text-foreground">{t("youth.tracksTitle")}</h2>
              <p className="text-muted-foreground mt-1">{t("youth.tracksDesc")}</p>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map((tr, i) => (
                <AnimatedSection key={i} delay={i * 80}>
                  <Card className="group hover:border-accent/50 transition-colors duration-300 h-full">
                    <CardContent className="pt-6">
                      <div className="p-2.5 rounded-lg bg-accent/10 text-accent w-fit mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">{tr.icon}</div>
                      <h3 className="font-bold text-foreground mb-2">{tr.title}</h3>
                      <p className="text-sm text-muted-foreground">{tr.desc}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container">
            <AnimatedSection className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">{t("youth.countryTitle")}</h2>
              <p className="text-muted-foreground mt-1">{t("youth.countryDesc")}</p>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {countries.map((c, i) => (
                <AnimatedSection key={i} delay={i * 60}>
                  <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardContent className="pt-6 flex items-center gap-4">
                      <FlagImg country={c.name} className="h-8 w-8" />
                      <div>
                        <p className="font-semibold text-card-foreground">{c.name}</p>
                        <Badge variant={c.status === t("common.registering") ? "default" : "secondary"} className="text-xs mt-1">{c.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-4xl">
            <AnimatedSection className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground">{t("youth.prizesTitle")}</h2>
              <p className="text-muted-foreground mt-1">{t("youth.prizesDesc")}</p>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {prizes.map((p, i) => (
                <AnimatedSection key={i} delay={i * 120}>
                  <Card className={`text-center h-full ${i === 0 ? "ring-2 ring-accent shadow-lg" : ""}`}>
                    <CardHeader>
                      <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${p.color} mb-2`}><Trophy className="h-6 w-6" /></div>
                      <CardTitle>{p.tier}</CardTitle>
                      <p className="text-3xl font-black text-foreground">{p.amount}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {p.benefits.map((b, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-center gap-2 justify-center"><Target className="h-3.5 w-3.5 text-accent flex-shrink-0" />{b}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <AnimatedSection className="mb-8"><h2 className="text-2xl font-bold text-foreground">{t("youth.objectivesTitle")}</h2></AnimatedSection>
            <div className="grid sm:grid-cols-2 gap-4">
              {objectives.map((obj, i) => (
                <AnimatedSection key={i} delay={i * 80}>
                  <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border"><Target className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">{obj}</p></div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container text-center">
            <AnimatedSection>
              <h2 className="text-3xl font-black text-foreground mb-4">{t("youth.ctaTitle")}</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t("youth.ctaDesc")}</p>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">{t("youth.ctaBtn")}</Button>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Youth;
