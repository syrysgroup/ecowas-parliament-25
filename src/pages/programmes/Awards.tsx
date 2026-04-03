import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Award, Trophy, MapPin, Calendar, Target, Users,
  Scale, Shield, Heart, Megaphone, Star, Crown, ArrowRight,
} from "lucide-react";

const categories = [
  { title: "Legislative Excellence Award", desc: "For outstanding contributions to lawmaking and regional policy development that have advanced the ECOWAS integration agenda.", icon: <Scale className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
  { title: "Champion of Integration Award", desc: "For advancing ECOWAS regional integration goals through sustained advocacy, diplomacy, and cross-border collaboration.", icon: <Users className="h-6 w-6" />, color: "bg-accent/10 text-accent" },
  { title: "Youth Advocacy Award", desc: "For parliamentarians championing youth participation, empowerment, and representation in governance processes.", icon: <Star className="h-6 w-6" />, color: "bg-ecowas-yellow/10 text-ecowas-yellow" },
  { title: "Women's Empowerment Award", desc: "For advancing gender equality, women's economic participation, and legislation protecting women's rights across the region.", icon: <Heart className="h-6 w-6" />, color: "bg-secondary/10 text-secondary" },
  { title: "Peace & Security Award", desc: "For contributions to conflict prevention, mediation, peacekeeping advocacy, and regional stability.", icon: <Shield className="h-6 w-6" />, color: "bg-ecowas-blue/10 text-ecowas-blue" },
  { title: "Community Service Award", desc: "For exceptional constituency engagement, civic outreach, and grassroots development initiatives benefiting citizens.", icon: <Megaphone className="h-6 w-6" />, color: "bg-ecowas-lime/10 text-ecowas-lime" },
  { title: "Lifetime Achievement Award", desc: "Honouring distinguished parliamentary service over a career — recognising decades of dedication to democratic governance.", icon: <Crown className="h-6 w-6" />, color: "bg-ecowas-red/10 text-ecowas-red" },
];

const nominationSteps = [
  { step: "01", title: "Nominations Open", desc: "March 2026 — nominations portal opens for parliamentarians, institutions, and civil society to submit candidates across all 7 categories.", month: "March" },
  { step: "02", title: "Review Committee", desc: "A distinguished panel of former speakers, legal scholars, and civil society leaders reviews all nominations against published criteria.", month: "April – August" },
  { step: "03", title: "Shortlisting", desc: "Top nominees in each category are shortlisted and notified. Their contributions are documented and shared publicly.", month: "September" },
  { step: "04", title: "Public Recognition", desc: "Shortlisted nominees are featured in official ECOWAS communications, building awareness and anticipation for the ceremony.", month: "October" },
  { step: "05", title: "Awards Ceremony", desc: "Winners are honoured at the Grand Finale gala in Abuja — a black-tie event attended by heads of state, diplomats, and distinguished guests.", month: "November" },
];

const honourees = [
  { name: "Hon. Aminata Touré", country: "🇸🇳 Senegal", category: "Legislative Excellence", year: "2026", quote: "Regional integration begins with the laws we craft together." },
  { name: "Hon. Kojo Mensah-Bonsu", country: "🇬🇭 Ghana", category: "Champion of Integration", year: "2026", quote: "Building bridges between nations is the highest calling of a parliamentarian." },
  { name: "Hon. Fatima Diallo", country: "🇲🇱 Mali", category: "Women's Empowerment", year: "2026", quote: "When women lead, communities thrive and nations prosper." },
  { name: "Hon. Chief Emeka Okonkwo", country: "🇳🇬 Nigeria", category: "Lifetime Achievement", year: "2026", quote: "Twenty-five years of service to West Africa's democratic dream." },
  { name: "Hon. Mariama Bah", country: "🇬🇲 The Gambia", category: "Youth Advocacy", year: "2026", quote: "The future belongs to the young people we empower today." },
  { name: "Hon. Ibrahima Koné", country: "🇨🇮 Côte d'Ivoire", category: "Peace & Security", year: "2026", quote: "Dialogue and diplomacy are our most powerful instruments." },
];

const objectives = [
  "Recognise and celebrate parliamentary excellence across ECOWAS Member States",
  "Inspire current and future legislators to strive for impactful governance",
  "Celebrate 25 years of democratic governance in the ECOWAS Parliament",
  "Strengthen institutional memory by documenting legislative achievements",
  "Foster a culture of accountability and service among elected representatives",
];

const Awards = () => (
  <Layout>
    {/* Hero */}
    <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <svg className="absolute top-10 right-10 w-64 h-64 animate-[pulse_5s_ease-in-out_infinite]" viewBox="0 0 120 120" fill="none">
          <polygon points="60,5 72,42 110,42 79,65 90,102 60,80 30,102 41,65 10,42 48,42" stroke="currentColor" strokeWidth="1" className="text-accent" fill="none" />
          <polygon points="60,20 68,42 90,42 72,56 78,78 60,65 42,78 48,56 30,42 52,42" stroke="currentColor" strokeWidth="0.5" className="text-accent" fill="none" opacity="0.5" />
        </svg>
        <svg className="absolute bottom-8 left-8 w-48 h-48 opacity-60" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" className="text-primary-foreground" />
          <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="0.5" className="text-accent" strokeDasharray="4 3" />
        </svg>
      </div>

      <div className="container relative">
        <AnimatedSection>
          <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-6 -ml-3">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-accent/20 text-accent">
              <Award className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">Programme Pillar</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">AWALCO Parliamentary<br />Awards</h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
            Honouring excellence, leadership, and service — celebrating the legislators who have shaped West Africa's democratic journey.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: <Trophy className="h-5 w-5" />, value: "7", label: "Award Categories" },
              { icon: <MapPin className="h-5 w-5" />, value: "15", label: "Countries" },
              { icon: <Calendar className="h-5 w-5" />, value: "Nov 2026", label: "Ceremony" },
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
          <h2 className="text-2xl font-bold text-foreground mb-4">About the Awards</h2>
          <p className="text-muted-foreground leading-relaxed">
            The AWALCO Parliamentary Awards honour serving and former members of the ECOWAS Parliament who have demonstrated exceptional leadership, legislative impact, and service to regional integration. Inaugurated as part of the 25th Anniversary celebrations, these awards recognise the individuals whose work has strengthened democratic governance, advanced the rights of citizens, and built bridges between the twelve Member States of the Community.
          </p>
        </AnimatedSection>
      </div>
    </section>

    {/* Award Categories */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">Award Categories</h2>
          <p className="text-muted-foreground mt-1">Seven categories recognising diverse dimensions of parliamentary excellence</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className={`p-3 rounded-xl ${cat.color} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-card-foreground mb-2">{cat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Nomination Process */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">Nomination Process</h2>
          <p className="text-muted-foreground mt-1">From nomination to recognition — a transparent, merit-based journey</p>
        </AnimatedSection>
        <div className="space-y-6">
          {nominationSteps.map((step, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className="relative flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-black text-lg">
                  {step.step}
                </div>
                <div className="flex-1 pb-6 border-b border-border last:border-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground">{step.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">{step.month}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Honourees */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">Inaugural Honourees</h2>
          <p className="text-muted-foreground mt-1">The first class of ECOWAS Parliamentary Award recipients</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {honourees.map((h, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center mb-4 mx-auto">
                    <Trophy className="h-7 w-7 text-accent" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-card-foreground">{h.name}</h3>
                    <p className="text-sm text-muted-foreground">{h.country}</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">{h.category}</Badge>
                    <p className="mt-3 text-sm italic text-muted-foreground">"{h.quote}"</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Ceremony Details */}
    <section className="py-16">
      <div className="container max-w-3xl">
        <AnimatedSection>
          <Card className="overflow-hidden">
            <div className="aspect-[3/1] bg-gradient-to-r from-primary via-accent/40 to-secondary flex items-center justify-center">
              <div className="text-center text-primary-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-black">Grand Finale & Awards Gala</p>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Event Details</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <Calendar className="h-4 w-4 text-primary" />November 2026
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />Abuja, Nigeria
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <Users className="h-4 w-4 text-primary" />Black-tie Gala Event
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Programme Highlights</p>
                  <ul className="space-y-2">
                    {["Awards ceremony & presentations", "Anniversary documentary premiere", "Vision 2050 keynote address", "Cultural performances"].map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 text-accent flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
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
          <h2 className="text-3xl font-black text-foreground mb-4">Nominate a Champion</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Know a parliamentarian whose service deserves recognition? Nominations open March 2026.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Nominations Opening Soon
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/timeline">View Timeline</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </Layout>
);

export default Awards;
