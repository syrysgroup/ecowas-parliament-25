import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroIllustration from "@/components/shared/HeroIllustration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Megaphone, MapPin, Users, Target, Tv, Plane,
  GraduationCap, ShoppingBag, Smartphone, Radio, Bus, Globe,
  Calendar, Star, Play,
} from "lucide-react";
import FlagImg from "@/components/shared/FlagImg";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";

const caravanStops = [
  { type: "Airports", desc: "Branded installations at major West African airports reaching thousands of travellers daily.", icon: <Plane className="h-6 w-6" /> },
  { type: "Schools & Universities", desc: "Interactive sessions with students, civic quizzes, and distribution of educational materials.", icon: <GraduationCap className="h-6 w-6" /> },
  { type: "Markets & Public Spaces", desc: "Pop-up awareness stands in high-traffic areas with multilingual outreach teams.", icon: <ShoppingBag className="h-6 w-6" /> },
  { type: "Digital Platforms", desc: "Social media campaigns, WhatsApp broadcasts, and interactive web content reaching youth online.", icon: <Smartphone className="h-6 w-6" /> },
];

const gameShow = {
  title: "The ECOWAS Challenge",
  format: "Weekly televised quiz show broadcast across ECOWAS Member States, testing contestants' knowledge of regional integration, history, governance, and culture.",
  episodes: [
    { theme: "History of ECOWAS", desc: "From the Treaty of Lagos to today" },
    { theme: "Trade & Economy", desc: "The ECOWAS Trade Liberalisation Scheme" },
    { theme: "Peace & Security", desc: "Conflict resolution across the region" },
    { theme: "Culture & Identity", desc: "Celebrating West African heritage" },
    { theme: "Youth & Innovation", desc: "The future of regional integration" },
    { theme: "Grand Finale", desc: "Champions from all episodes compete" },
  ],
};

const touchpoints = [
  { name: "Airports", icon: <Plane className="h-5 w-5" />, reach: "50,000+ travellers" },
  { name: "Schools", icon: <GraduationCap className="h-5 w-5" />, reach: "30,000+ students" },
  { name: "Buses & Transit", icon: <Bus className="h-5 w-5" />, reach: "100,000+ commuters" },
  { name: "Social Media", icon: <Smartphone className="h-5 w-5" />, reach: "2M+ impressions" },
  { name: "Radio", icon: <Radio className="h-5 w-5" />, reach: "5M+ listeners" },
  { name: "Television", icon: <Tv className="h-5 w-5" />, reach: "10M+ viewers" },
];

const impactStats = [
  { value: "50+", label: "Communities Reached" },
  { value: "7", label: "Countries Covered" },
  { value: "15M+", label: "Citizens Target Reach" },
  { value: "2", label: "Flagship Initiatives" },
];

const countries = [
  { name: "Nigeria" },
  { name: "Ghana" },
  { name: "Côte d'Ivoire" },
  { name: "Senegal" },
  { name: "Cabo Verde" },
  { name: "Togo" },
  { name: "Sierra Leone" },
];

const objectives = [
  "Deploy the ECOWAS Caravan across communities in multiple Member States",
  "Reach citizens through airports, schools, buses, and digital platforms",
  "Promote messages of regional unity and civic responsibility",
  "Launch the ECOWAS TV Game Show for civic education through entertainment",
  "Build public understanding of the ECOWAS Parliament Initiatives's role and impact",
];

const Civic = () => (
  <Layout>
    <ProgrammeSponsorMarquee programme="civic" />
    {/* Hero */}
    <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
      <HeroIllustration theme="civic" />
      <div className="container relative">
        <AnimatedSection>
          <Button asChild variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 mb-6 -ml-3">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-ecowas-blue/20 text-ecowas-blue">
              <Megaphone className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">Programme Pillar</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Civic Education<br />& Awareness</h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">The ECOWAS Caravan and TV Game Show — bringing Parliament closer to citizens.</p>
        </AnimatedSection>
        <AnimatedSection delay={200}>
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: <MapPin className="h-5 w-5" />, value: "7", label: "Countries" },
              { icon: <Megaphone className="h-5 w-5" />, value: "2", label: "Initiatives" },
              { icon: <Users className="h-5 w-5" />, value: "50+", label: "Communities" },
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
          <p className="text-muted-foreground leading-relaxed">The ECOWAS Caravan moves through communities — airports, schools, buses, digital platforms — bringing the Parliament closer to citizens. Messages of regional unity and civic responsibility travel where people live and work, turning awareness into ownership. The programme culminates with the ECOWAS TV Game Show, blending learning with entertainment and building civic knowledge across the airwaves. Together, these two flagship initiatives aim to transform how West Africans understand and engage with their regional Parliament.</p>
        </AnimatedSection>
      </div>
    </section>

    {/* ECOWAS Caravan */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-ecowas-blue/10 text-ecowas-blue"><Globe className="h-5 w-5" /></div>
            <h2 className="text-2xl font-bold text-foreground">The ECOWAS Caravan</h2>
          </div>
          <p className="text-muted-foreground mt-1">Taking Parliament to the people — where they live, work, and travel</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {caravanStops.map((s, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <Card className="h-full group hover:shadow-lg hover:border-ecowas-blue/40 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="p-3 rounded-xl bg-ecowas-blue/10 text-ecowas-blue w-fit mb-4 group-hover:bg-ecowas-blue group-hover:text-primary-foreground transition-colors duration-300">{s.icon}</div>
                  <h3 className="font-bold text-card-foreground text-lg mb-2">{s.type}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* TV Game Show */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10 text-accent"><Tv className="h-5 w-5" /></div>
            <h2 className="text-2xl font-bold text-foreground">The ECOWAS Challenge — TV Game Show</h2>
          </div>
          <p className="text-muted-foreground">{gameShow.format}</p>
        </AnimatedSection>
        <AnimatedSection delay={100} className="mb-8">
          <h3 className="font-semibold text-foreground mb-4">Episode Themes</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {gameShow.episodes.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border group hover:border-accent/40 transition-colors duration-300">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                  {i === 5 ? <Star className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground text-sm">{e.theme}</h4>
                  <p className="text-xs text-muted-foreground">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Touchpoints */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">Citizen Touchpoints</h2>
          <p className="text-muted-foreground mt-1">How we reach 15 million+ citizens across West Africa</p>
        </AnimatedSection>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {touchpoints.map((t, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <Card className="text-center hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-ecowas-blue/10 text-ecowas-blue flex items-center justify-center mb-3">{t.icon}</div>
                  <p className="font-bold text-card-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.reach}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Community Impact */}
    <section className="py-16">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">Community Impact</h2>
        </AnimatedSection>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {impactStats.map((s, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <p className="text-4xl font-black text-ecowas-blue">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Countries */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Participating Countries</h2>
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <div className="flex flex-wrap gap-3">
            {countries.map((c) => (
              <div key={c.name} className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border text-sm font-medium text-foreground">
                <FlagImg country={c.name} className="h-5 w-5" />{c.name}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Objectives */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Objectives</h2>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {objectives.map((obj, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border">
                <Target className="h-5 w-5 text-ecowas-blue flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-black text-foreground mb-4">Be Part of the Movement</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Help bring civic education to every corner of West Africa.</p>
          <Button size="lg" className="bg-ecowas-blue text-primary-foreground hover:bg-ecowas-blue/90">
            Get Involved in Civic Education
          </Button>
        </AnimatedSection>
      </div>
    </section>
    <ProgrammeSponsorsFooter programme="civic" />
  </Layout>
);

export default Civic;
