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

const cities = [
  { city: "Abidjan", country: "Côte d'Ivoire", flag: "🇨🇮", date: "March 2026", focus: "Agriculture & Agribusiness", status: "Confirmed" },
  { city: "Accra", country: "Ghana", flag: "🇬🇭", date: "April 2026", focus: "Digital Services & FinTech", status: "Confirmed" },
  { city: "Lomé", country: "Togo", flag: "🇹🇬", date: "May 2026", focus: "Textiles & Fashion", status: "Planning" },
  { city: "Freetown", country: "Sierra Leone", flag: "🇸🇱", date: "June 2026", focus: "Mining & Natural Resources", status: "Planning" },
  { city: "Lagos", country: "Nigeria", flag: "🇳🇬", date: "July 2026", focus: "Manufacturing & Creative Industries", status: "Confirmed" },
];

const corridors = [
  { route: "Abidjan — Accra", countries: "🇨🇮 → 🇬🇭", focus: "Agricultural goods, processed foods, digital services", color: "border-l-primary" },
  { route: "Lagos — Lomé", countries: "🇳🇬 → 🇹🇬", focus: "Manufactured goods, textiles, consumer electronics", color: "border-l-accent" },
  { route: "Freetown — Conakry", countries: "🇸🇱 → 🇬🇳", focus: "Mining supplies, construction materials, food products", color: "border-l-secondary" },
];

const sectors = [
  { name: "Agriculture", icon: <Wheat className="h-4 w-4" /> },
  { name: "Textiles & Fashion", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Digital Services", icon: <Monitor className="h-4 w-4" /> },
  { name: "Manufacturing", icon: <Factory className="h-4 w-4" /> },
  { name: "Creative Industries", icon: <Palette className="h-4 w-4" /> },
];

const personas = [
  { title: "SME Owners", desc: "Entrepreneurs looking to expand into cross-border markets and meet B2B partners.", icon: <Briefcase className="h-6 w-6" /> },
  { title: "Trade Facilitators", desc: "Customs brokers, logistics providers, and trade finance specialists.", icon: <Globe className="h-6 w-6" /> },
  { title: "Policymakers", desc: "Government officials shaping trade policy and regulatory frameworks.", icon: <Building className="h-6 w-6" /> },
  { title: "Women Entrepreneurs", desc: "Women-led businesses accessing dedicated networking and mentorship tracks.", icon: <Heart className="h-6 w-6" /> },
];

const matchmakingSteps = [
  { step: "1", title: "Register & Profile", desc: "Create your business profile, select your sector, and specify what you're looking for." },
  { step: "2", title: "AI Matching", desc: "Our platform analyses profiles to suggest the most compatible B2B partners across borders." },
  { step: "3", title: "Pre-Forum Connect", desc: "Receive your match list before the forum and schedule one-on-one meetings." },
  { step: "4", title: "Live B2B Sessions", desc: "Meet your matches face-to-face at structured networking sessions during the forum." },
];

const objectives = [
  "Organise B2B trade forums in five West African cities",
  "Establish pilot trade corridors for cross-border SME activity",
  "Facilitate dialogue between entrepreneurs and policymakers",
  "Promote women-led and youth-led enterprises in regional trade",
  "Document trade facilitation outcomes and recommendations",
];

const Trade = () => (
  <Layout>
    {/* Hero */}
    <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
      <HeroIllustration theme="trade" />
      <div className="container relative">
        <AnimatedSection>
          <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-6 -ml-3">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary-foreground/10 text-primary-foreground">
              <TrendingUp className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">Programme Pillar</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Trade & SME<br />Forums</h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">Working platforms where regional trade becomes practical, inclusive, and bankable.</p>
        </AnimatedSection>
        <AnimatedSection delay={200}>
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: <MapPin className="h-5 w-5" />, value: "5", label: "Cities" },
              { icon: <Users className="h-5 w-5" />, value: "200+", label: "SMEs Target" },
              { icon: <Handshake className="h-5 w-5" />, value: "3", label: "Pilot Corridors" },
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
          <p className="text-muted-foreground leading-relaxed">Entrepreneurs gather in cities across the region — Abidjan, Accra, Lomé, Freetown, Lagos — connecting through B2B forums, pilot trade corridors, and dialogue with policymakers. These are not symbolic meetings; they are working platforms where regional trade becomes practical, inclusive, and bankable. The forums bring together SMEs, trade facilitators, and government officials to advance cross-border commerce and build the economic backbone of ECOWAS integration.</p>
        </AnimatedSection>
      </div>
    </section>

    {/* Forum Cities */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">Forum Cities</h2>
          <p className="text-muted-foreground mt-1">Five forums across West Africa, each with a sector focus</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((c, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <Card className="h-full group hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{c.flag}</span>
                    <Badge variant={c.status === "Confirmed" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                  </div>
                  <CardTitle className="text-lg">{c.city}</CardTitle>
                  <p className="text-xs text-muted-foreground">{c.country} · {c.date}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground"><span className="font-medium text-card-foreground">Focus:</span> {c.focus}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* B2B Matchmaking */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">B2B Matchmaking Process</h2>
          <p className="text-muted-foreground mt-1">How we connect entrepreneurs across borders</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {matchmakingSteps.map((m, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className="flex gap-4 p-5 rounded-xl bg-card border border-border group hover:border-primary/30 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-black text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">{m.step}</div>
                <div>
                  <h4 className="font-semibold text-card-foreground">{m.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Pilot Trade Corridors */}
    <section className="py-16 bg-muted/30">
      <div className="container max-w-3xl">
        <AnimatedSection className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Pilot Trade Corridors</h2>
          <p className="text-muted-foreground mt-1">Three cross-border corridors facilitating real commerce</p>
        </AnimatedSection>
        <div className="space-y-4">
          {corridors.map((c, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className={`p-5 rounded-xl bg-card border border-border border-l-4 ${c.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{c.countries}</span>
                  <h4 className="font-bold text-card-foreground">{c.route}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{c.focus}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Key Sectors */}
    <section className="py-16">
      <div className="container">
        <AnimatedSection className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Key Sectors</h2>
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <div className="flex flex-wrap gap-3">
            {sectors.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:border-primary/40 transition-colors duration-300">
                <span className="text-primary">{s.icon}</span>{s.name}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Who Should Attend */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">Who Should Attend</h2>
        </AnimatedSection>
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
                <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-black text-foreground mb-4">Join the Trade Revolution</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Connect with SMEs, policymakers, and trade facilitators across West Africa.</p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Register for a Trade Forum
          </Button>
        </AnimatedSection>
      </div>
    </section>
  </Layout>
);

export default Trade;
