import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroIllustration from "@/components/shared/HeroIllustration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Lightbulb, Users, MapPin, Calendar, Target, Trophy,
  Cpu, Stethoscope, Landmark, Leaf, GraduationCap, ArrowRight, Rocket, Star,
} from "lucide-react";

const phases = [
  { step: "01", title: "National Competitions", desc: "Smart Challenge launches in each Member State with local innovators pitching solutions to regional problems.", icon: <Rocket className="h-6 w-6" /> },
  { step: "02", title: "Country Finals", desc: "Top innovators compete at national finals judged by industry experts, academics, and government officials.", icon: <Star className="h-6 w-6" /> },
  { step: "03", title: "Regional Finale — Accra", desc: "National winners converge in Accra, Ghana for the grand finale showcasing the best of West African youth innovation.", icon: <Trophy className="h-6 w-6" /> },
];

const tracks = [
  { title: "AgriTech", desc: "Innovations improving food security, supply chains, and agricultural productivity.", icon: <Leaf className="h-5 w-5" /> },
  { title: "HealthTech", desc: "Digital health solutions addressing healthcare access and disease prevention.", icon: <Stethoscope className="h-5 w-5" /> },
  { title: "FinTech", desc: "Financial inclusion tools for cross-border payments, savings, and micro-lending.", icon: <Landmark className="h-5 w-5" /> },
  { title: "CleanEnergy", desc: "Sustainable energy solutions for off-grid communities and green transitions.", icon: <Lightbulb className="h-5 w-5" /> },
  { title: "EdTech", desc: "Learning platforms and tools bridging educational gaps across the region.", icon: <GraduationCap className="h-5 w-5" /> },
];

const countries = [
  { name: "Nigeria", flag: "🇳🇬", status: "Registering" },
  { name: "Ghana", flag: "🇬🇭", status: "Registering" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", status: "Upcoming" },
  { name: "Senegal", flag: "🇸🇳", status: "Upcoming" },
  { name: "Cabo Verde", flag: "🇨🇻", status: "Upcoming" },
  { name: "Togo", flag: "🇹🇬", status: "Upcoming" },
  { name: "Sierra Leone", flag: "🇸🇱", status: "Upcoming" },
];

const prizes = [
  { tier: "Gold", color: "bg-accent text-accent-foreground", amount: "$10,000", benefits: ["Mentorship programme", "Incubation support", "ECOWAS policy presentation"] },
  { tier: "Silver", color: "bg-muted text-foreground", amount: "$5,000", benefits: ["Mentorship programme", "Regional networking", "Media feature"] },
  { tier: "Bronze", color: "bg-secondary/20 text-secondary", amount: "$2,500", benefits: ["Mentorship programme", "Certificate of recognition", "Alumni network"] },
];

const objectives = [
  "Launch national Smart Challenge competitions across Member States",
  "Identify and nurture young innovators with solutions for regional challenges",
  "Host a regional finale in Accra bringing together national winners",
  "Create mentorship and networking opportunities for young entrepreneurs",
  "Document youth-driven solutions for regional integration",
];

const Youth = () => (
  <Layout>
    {/* Hero */}
    <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
      <HeroIllustration theme="youth" />
      <div className="container relative">
        <AnimatedSection>
          <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-6 -ml-3">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-accent/20 text-accent">
              <Lightbulb className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">Programme Pillar</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Youth Innovation &<br />Smart Challenge</h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">Igniting ideas and ambition through national competitions converging in a regional finale.</p>
        </AnimatedSection>
        <AnimatedSection delay={200}>
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: <MapPin className="h-5 w-5" />, value: "7", label: "Countries" },
              { icon: <Rocket className="h-5 w-5" />, value: "3", label: "Phases" },
              { icon: <Trophy className="h-5 w-5" />, value: "Accra", label: "Regional Finale" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-foreground/10">{s.icon}</div>
                <div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-primary-foreground/50">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Overview */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection>
          <h2 className="text-2xl font-bold text-foreground mb-4">Overview & Vision</h2>
          <p className="text-muted-foreground leading-relaxed">The ECOWAS Smart Challenge invites young innovators from across the region to participate in national competitions that ignite ideas and ambition. National winners converge in Accra, Ghana for a regional finale showcasing the best of West African youth innovation. This pillar embodies the Parliament's commitment to empowering the next generation of leaders and changemakers, turning bold ideas into scalable solutions for the region's most pressing challenges.</p>
        </AnimatedSection>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">How It Works</h2>
          <p className="text-muted-foreground mt-1">Three phases from local pitch to regional stage</p>
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
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 text-accent/40">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Innovation Tracks */}
    <section className="py-16">
      <div className="container">
        <AnimatedSection className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">Innovation Tracks</h2>
          <p className="text-muted-foreground mt-1">Five challenge categories addressing West Africa's priorities</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((t, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <Card className="group hover:border-accent/50 transition-colors duration-300 h-full">
                <CardContent className="pt-6">
                  <div className="p-2.5 rounded-lg bg-accent/10 text-accent w-fit mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">{t.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Country Competitions */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Country Competitions</h2>
          <p className="text-muted-foreground mt-1">Status of Smart Challenge across participating nations</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {countries.map((c, i) => (
            <AnimatedSection key={i} delay={i * 60}>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6 flex items-center gap-4">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <p className="font-semibold text-card-foreground">{c.name}</p>
                    <Badge variant={c.status === "Registering" ? "default" : "secondary"} className="text-xs mt-1">
                      {c.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Prizes */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">Prizes & Recognition</h2>
          <p className="text-muted-foreground mt-1">Rewarding innovation at the regional finale</p>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-6">
          {prizes.map((p, i) => (
            <AnimatedSection key={i} delay={i * 120}>
              <Card className={`text-center h-full ${i === 0 ? "ring-2 ring-accent shadow-lg" : ""}`}>
                <CardHeader>
                  <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${p.color} mb-2`}>
                    <Trophy className="h-6 w-6" />
                  </div>
                  <CardTitle>{p.tier}</CardTitle>
                  <p className="text-3xl font-black text-foreground">{p.amount}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {p.benefits.map((b, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                        <Target className="h-3.5 w-3.5 text-accent flex-shrink-0" />{b}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Objectives */}
    <section className="py-16 bg-muted/30">
      <div className="container max-w-4xl">
        <AnimatedSection className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Objectives</h2>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {objectives.map((obj, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border">
                <Target className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{obj}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="container text-center">
        <AnimatedSection>
          <h2 className="text-3xl font-black text-foreground mb-4">Ready to Innovate?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join hundreds of young innovators shaping West Africa's future through technology and entrepreneurship.</p>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            Register for the Smart Challenge
          </Button>
        </AnimatedSection>
      </div>
    </section>
  </Layout>
);

export default Youth;
