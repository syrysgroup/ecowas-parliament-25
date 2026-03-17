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

const streams = [
  { title: "Trade Platforms", desc: "Dedicated market spaces and exhibitions connecting women-owned businesses across borders, facilitating product showcases and buyer-seller matching.", icon: <ShoppingBag className="h-6 w-6" /> },
  { title: "Entrepreneurship Workshops", desc: "Hands-on capacity-building sessions covering business planning, financial literacy, digital marketing, and export readiness.", icon: <GraduationCap className="h-6 w-6" /> },
  { title: "Networking & Mentorship", desc: "Structured mentorship pairing emerging women entrepreneurs with established business leaders and regional trade experts.", icon: <Handshake className="h-6 w-6" /> },
];

const stories = [
  { name: "Amina Diallo", country: "Senegal", business: "Shea Butter Cooperative", quote: "Through the ECOWAS platform, we connected with buyers in three new countries within our first year. Our cooperative now supports 120 women." },
  { name: "Grace Mensah", country: "Ghana", business: "TechSista Digital Agency", quote: "The mentorship programme gave me the confidence and skills to scale my agency from a one-woman operation to a team of fifteen." },
  { name: "Fatou Koroma", country: "Sierra Leone", business: "Freetown Textiles", quote: "Accessing cross-border markets used to feel impossible. The trade corridors initiative made it real — we now export to four ECOWAS countries." },
];

const workshops = [
  { title: "Financial Literacy & Access to Capital", country: "Nigeria", date: "March 2026", topic: "Micro-finance, grant applications, investor readiness" },
  { title: "Digital Marketing Masterclass", country: "Ghana", date: "April 2026", topic: "Social media strategy, e-commerce platforms, brand building" },
  { title: "Export Readiness Workshop", country: "Côte d'Ivoire", date: "May 2026", topic: "Customs procedures, packaging standards, trade documentation" },
  { title: "Leadership & Negotiation", country: "Senegal", date: "June 2026", topic: "Negotiation skills, boardroom leadership, public speaking" },
  { title: "Supply Chain Management", country: "Togo", date: "July 2026", topic: "Logistics, warehousing, inventory management, cold chains" },
  { title: "Advocacy & Policy Engagement", country: "Sierra Leone", date: "Aug 2026", topic: "Engaging policymakers, drafting position papers, coalition building" },
];

const metrics = [
  { value: "500+", label: "Women Entrepreneurs Targeted", icon: <Users className="h-6 w-6" /> },
  { value: "150+", label: "Businesses to Support", icon: <TrendingUp className="h-6 w-6" /> },
  { value: "6", label: "Countries Participating", icon: <MapPin className="h-6 w-6" /> },
  { value: "12", label: "Workshops Planned", icon: <Calendar className="h-6 w-6" /> },
];

const countries = [
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Côte d'Ivoire", flag: "🇨🇮" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Togo", flag: "🇹🇬" },
  { name: "Sierra Leone", flag: "🇸🇱" },
];

const objectives = [
  "Create dedicated women-focused trade and entrepreneurship platforms",
  "Support women entrepreneurs in accessing cross-border markets",
  "Host capacity-building workshops for women-led SMEs",
  "Build networks of women entrepreneurs across ECOWAS Member States",
  "Advocate for policies supporting women's economic empowerment",
];

const Women = () => (
  <Layout>
    {/* Hero */}
    <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
      <HeroIllustration theme="women" />
      <div className="container relative">
        <AnimatedSection>
          <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-6 -ml-3">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-secondary/20 text-secondary">
              <Heart className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">Programme Pillar</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Women's Economic<br />Empowerment</h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">Women-focused trade and entrepreneurship platforms driving inclusive growth across West Africa.</p>
        </AnimatedSection>
        <AnimatedSection delay={200}>
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: <MapPin className="h-5 w-5" />, value: "6", label: "Countries" },
              { icon: <Users className="h-5 w-5" />, value: "500+", label: "Women Target" },
              { icon: <Calendar className="h-5 w-5" />, value: "12", label: "Workshops" },
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
          <p className="text-muted-foreground leading-relaxed">This pillar centres women as key drivers of regional economic growth and integration. Through dedicated trade platforms, entrepreneurship workshops, and networking opportunities, the programme creates spaces where women entrepreneurs can connect, learn, and grow their businesses across borders. The initiative aligns with the Parliament's commitment to gender inclusion, recognising that sustainable regional integration is only possible when women participate fully in the economic life of the community.</p>
        </AnimatedSection>
      </div>
    </section>

    {/* Programme Streams */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">Programme Streams</h2>
          <p className="text-muted-foreground mt-1">Three interconnected streams for holistic empowerment</p>
        </AnimatedSection>
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
      </div>
    </section>

    {/* Impact Stories */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">Voices of Impact</h2>
          <p className="text-muted-foreground mt-1">Stories from women entrepreneurs across the region</p>
        </AnimatedSection>
        <div className="space-y-6">
          {stories.map((s, i) => (
            <AnimatedSection key={i} delay={i * 120}>
              <div className="p-6 rounded-xl bg-card border border-border relative">
                <Quote className="h-8 w-8 text-secondary/20 absolute top-4 right-4" />
                <p className="text-muted-foreground italic mb-4 pr-10">"{s.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm">{s.name[0]}</div>
                  <div>
                    <p className="font-semibold text-card-foreground text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.business} · {s.country}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Workshop Calendar */}
    <section className="py-16 bg-muted/30">
      <div className="container max-w-3xl">
        <AnimatedSection className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Workshop Calendar</h2>
          <p className="text-muted-foreground mt-1">Capacity-building sessions across ECOWAS Member States</p>
        </AnimatedSection>
        <div className="space-y-3">
          {workshops.map((w, i) => (
            <AnimatedSection key={i} delay={i * 60}>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground text-sm">{w.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{w.country} · {w.date}</p>
                  <p className="text-xs text-muted-foreground mt-1">{w.topic}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Success Metrics */}
    <section className="py-16">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">Programme Targets</h2>
        </AnimatedSection>
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
                <span className="text-lg">{c.flag}</span>{c.name}
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
                <Target className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-black text-foreground mb-4">Empower. Connect. Grow.</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join the movement for women's economic empowerment across West Africa.</p>
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Join the Women's Empowerment Programme
          </Button>
        </AnimatedSection>
      </div>
    </section>
  </Layout>
);

export default Women;
