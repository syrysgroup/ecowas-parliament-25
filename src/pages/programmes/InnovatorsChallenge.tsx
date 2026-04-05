import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SponsorPlaceholderLogo from "@/components/shared/SponsorPlaceholderLogo";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";
import FlagImg from "@/components/shared/FlagImg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Lightbulb, Rocket, Star, Trophy, Target,
  Leaf, Stethoscope, Landmark, GraduationCap, MapPin, Calendar,
  Users, ArrowRight, Zap, Globe,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import heroBg from "@/assets/innovators-hero-bg.jpg";

const sponsors = [
  { name: "NASENI" },
  { name: "SMEDAN" },
  { name: "Canada" },
];

const InnovatorsChallenge = () => {
  const { t } = useTranslation();

  const tracks = [
    { title: "AgriTech", desc: "Agricultural technology solutions for food security and sustainable farming across West Africa.", icon: <Leaf className="h-6 w-6" />, color: "from-primary/20 to-primary/5" },
    { title: "HealthTech", desc: "Digital health innovations improving healthcare access and delivery in underserved communities.", icon: <Stethoscope className="h-6 w-6" />, color: "from-secondary/20 to-secondary/5" },
    { title: "FinTech", desc: "Financial technology solutions driving financial inclusion and cross-border payments.", icon: <Landmark className="h-6 w-6" />, color: "from-accent/20 to-accent/5" },
    { title: "Clean Energy", desc: "Renewable energy innovations addressing the energy gap across the ECOWAS region.", icon: <Lightbulb className="h-6 w-6" />, color: "from-primary/20 to-primary/5" },
    { title: "EdTech", desc: "Educational technology platforms expanding access to quality learning for all.", icon: <GraduationCap className="h-6 w-6" />, color: "from-secondary/20 to-secondary/5" },
  ];

  const phases = [
    { step: "01", title: "Applications & Selection", desc: "Submit your innovative solution. Top teams are shortlisted through a rigorous evaluation process.", icon: <Rocket className="h-6 w-6" /> },
    { step: "02", title: "Bootcamp & Mentorship", desc: "Selected teams undergo intensive mentorship, pitch training, and product development workshops.", icon: <Star className="h-6 w-6" /> },
    { step: "03", title: "Grand Finale & Awards", desc: "Finalists pitch to a panel of investors and industry leaders. Winners receive funding and incubation.", icon: <Trophy className="h-6 w-6" /> },
  ];

  const countries = [
    { name: "Nigeria", status: "Registering" },
    { name: "Ghana", status: "Registering" },
    { name: "Côte d'Ivoire", status: "Upcoming" },
    { name: "Senegal", status: "Upcoming" },
    { name: "Cabo Verde", status: "Upcoming" },
    { name: "Togo", status: "Upcoming" },
    { name: "Sierra Leone", status: "Upcoming" },
  ];

  const prizes = [
    { tier: "Gold", amount: "$10,000", benefits: ["6-month incubation programme", "Mentorship from industry leaders", "Policy presentation to ECOWAS"], color: "bg-accent" },
    { tier: "Silver", amount: "$5,000", benefits: ["3-month mentorship", "Regional networking access", "Media feature & spotlight"], color: "bg-muted" },
    { tier: "Bronze", amount: "$2,500", benefits: ["Mentorship pairing", "Certificate of excellence", "Alumni network access"], color: "bg-secondary/20" },
  ];

  return (
    <Layout>
      <ProgrammeSponsorMarquee sponsors={sponsors} />
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-accent/30 animate-particle"
              style={{
                width: `${8 + i * 4}px`,
                height: `${8 + i * 4}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <Button asChild variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 mb-8">
            <Link to="/programmes/youth"><ArrowLeft className="mr-2 h-4 w-4" />Back to Youth</Link>
          </Button>

          <div className="max-w-2xl">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 animate-fade-in">
              <Lightbulb className="h-3 w-3 mr-1" /> ECOWAS Parliament @25
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground mb-6 animate-slide-up">
              Innovators<br />
              <span className="text-accent">Challenge</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              A multi-country startup competition empowering young West African entrepreneurs to build solutions across 5 innovation tracks — from AgriTech to EdTech.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-8 mt-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            {[
              { icon: <Globe className="h-4 w-4" />, label: "7 Countries", value: "" },
              { icon: <Users className="h-4 w-4" />, label: "500+ Startups", value: "" },
              { icon: <Target className="h-4 w-4" />, label: "5 Tracks", value: "" },
              { icon: <Trophy className="h-4 w-4" />, label: "$17,500 in Prizes", value: "" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-primary-foreground/60">
                {s.icon}
                <span className="text-sm font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Tracks */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">5 Innovation Tracks</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                Choose Your <span className="text-primary">Track</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Each track focuses on a critical sector where innovation can transform West Africa.</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track, i) => (
              <AnimatedSection key={track.title} delay={i * 100}>
                <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border/50 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${track.color}`} />
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                      {track.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{track.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{track.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Phases Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-accent/10 text-accent-foreground border-accent/20 mb-4">Competition Journey</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                Three Phases to <span className="text-accent">Glory</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {phases.map((phase, i) => (
              <AnimatedSection key={phase.step} delay={i * 150}>
                <div className="relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-0.5 bg-gradient-to-r from-primary/40 to-primary/10" />
                  )}
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                      <span className="text-2xl font-black text-primary-foreground">{phase.step}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3 text-accent">
                      {phase.icon}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{phase.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{phase.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-accent/10 text-accent-foreground border-accent/20 mb-4">
                <Trophy className="h-3 w-3 mr-1" /> Prizes & Awards
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                Win Big, <span className="text-primary">Build Bigger</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {prizes.map((prize, i) => (
              <AnimatedSection key={prize.tier} delay={i * 100}>
                <Card className={`text-center overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${i === 0 ? "ring-2 ring-accent" : ""}`}>
                  <div className={`py-4 ${prize.color}`}>
                    <Trophy className={`h-8 w-8 mx-auto ${i === 0 ? "text-accent-foreground" : "text-foreground/60"}`} />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-1">{prize.tier}</h3>
                    <p className="text-3xl font-black text-primary mb-4">{prize.amount}</p>
                    <ul className="space-y-2">
                      {prize.benefits.map((b, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Zap className="h-3 w-3 text-accent mt-1 shrink-0" />
                          {b}
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

      {/* Countries */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                <MapPin className="h-3 w-3 mr-1" /> Participating Countries
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                Across <span className="text-primary">7 Nations</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {countries.map((c, i) => (
              <AnimatedSection key={c.name} delay={i * 80}>
                <div className="flex items-center gap-3 bg-card rounded-xl px-5 py-3 border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <FlagImg country={c.name} className="w-8 h-6 rounded" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{c.name}</p>
                    <p className={`text-xs ${c.status === "Registering" ? "text-primary font-medium" : "text-muted-foreground"}`}>{c.status}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Innovate?</h2>
            <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
              Applications are open for young entrepreneurs across West Africa. Turn your idea into a funded venture.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <ProgrammeSponsorsFooter programme="innovators" tiers={[
        { label: "Programme Partners", sponsors },
        { label: "Institutional Partners", sponsors: [{ name: "ECOWAS Commission" }, { name: "AWALCO" }] },
      ]} />
    </Layout>
  );
};

export default InnovatorsChallenge;
