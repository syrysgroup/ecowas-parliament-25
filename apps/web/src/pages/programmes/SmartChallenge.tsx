import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";
import FlagImg from "@/components/shared/FlagImg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, BrainCircuit, ArrowRight, Trophy, Users, Globe, Target,
  BookOpen, Calculator, FlaskConical, TrendingUp, Landmark, Tv, Shield,
  Award, Zap, Eye, Monitor, Mic, ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import heroBg from "@/assets/smart-challenge-hero-bg.jpg";

const SmartChallenge = () => {
  const { t } = useTranslation();

  const subjects = [
    { title: "ECOWAS & History", questions: 15, time: "20 min", weight: "×1.5", icon: <Landmark className="h-5 w-5" />, note: "Universal gateway — mandatory minimum threshold" },
    { title: "Mathematics", questions: 10, time: "15 min", weight: "×1.0", icon: <Calculator className="h-5 w-5" />, note: "Declare as Major for enhanced ranking weight" },
    { title: "Science", questions: 10, time: "15 min", weight: "×1.0", icon: <FlaskConical className="h-5 w-5" />, note: "Declare as Major for enhanced ranking weight" },
    { title: "Economics", questions: 10, time: "15 min", weight: "×1.0", icon: <TrendingUp className="h-5 w-5" />, note: "Declare as Major for enhanced ranking weight" },
  ];

  const rounds = [
    { num: 1, title: "School Screening", desc: "Eligibility gate — all registered students sit online exam at their school.", type: "online", gate: "40%" },
    { num: 2, title: "School Finals", desc: "Top 4 students per school selected — one per Major subject.", type: "online", gate: "45%" },
    { num: 3, title: "District Finals", desc: "School representatives compete across LGA/District.", type: "online", gate: "50%" },
    { num: 4, title: "Regional Finals", desc: "District winners advance to state/regional competition.", type: "online", gate: "55%" },
    { num: 5, title: "National Finals", desc: "Form the official 4-member national team.", type: "online", gate: "60%" },
    { num: 6, title: "Group Stage", desc: "12 national teams compete in live broadcast matches — Subject Duels + Debates.", type: "live", gate: "65%" },
    { num: 7, title: "Grand Finale", desc: "Continental championship — live broadcast across West Africa.", type: "live", gate: "—" },
  ];

  const countries = [
    "Nigeria", "Ghana", "Côte d'Ivoire", "Senegal", "Cabo Verde", "Togo",
    "Sierra Leone", "Liberia", "Guinea", "Guinea-Bissau", "The Gambia", "Benin",
  ];

  const stats = [
    { value: "12", label: "Nations", icon: <Globe className="h-5 w-5" /> },
    { value: "50,000+", label: "Target Students", icon: <Users className="h-5 w-5" /> },
    { value: "7", label: "Competition Rounds", icon: <Target className="h-5 w-5" /> },
    { value: "4", label: "Subjects", icon: <BookOpen className="h-5 w-5" /> },
  ];

  return (
    <Layout>
      <ProgrammeSponsorMarquee programme="smart" />
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} decoding="async" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(0,0%,8%)]/95 via-[hsl(0,0%,8%)]/80 to-[hsl(0,0%,8%)]/50" />

        {/* Animated glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <Button asChild variant="secondary" className="bg-white/15 text-white hover:bg-white/25 mb-8">
            <Link to="/programmes/youth"><ArrowLeft className="mr-2 h-4 w-4" />Back to Youth</Link>
          </Button>

          <div className="max-w-2xl">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 animate-fade-in">
              <BrainCircuit className="h-3 w-3 mr-1" /> Powered by SMARTq
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 animate-slide-up">
              ECOWAS Parliament Initiatives<br />
              <span className="text-[hsl(50,87%,45%)]">Smart Challenge</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              The premier continental academic competition for secondary school students across all 12 ECOWAS member states.
            </p>
            <p className="text-white/50 text-sm mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              7 rounds · 4 subjects · Dual-track scoring · Live broadcast finale
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Button size="lg" className="bg-[hsl(50,87%,45%)] text-[hsl(0,0%,8%)] hover:bg-[hsl(50,87%,50%)] font-bold">
                Register Your School <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Watch Trailer
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 animate-slide-up"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <div className="text-[hsl(50,87%,45%)] mx-auto mb-2">{s.icon}</div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/50 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">About the Competition</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">
                The Definitive Academic Competition of <span className="text-primary">West Africa</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Built on SMARTq — a proprietary digital learning and examination platform — the Smart Challenge is a seven-round competition that begins with nationwide screening, progresses through sub-national and national stages, and culminates in a live broadcast continental championship.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { icon: <Monitor className="h-5 w-5" />, label: "Online Written Exams", sub: "Rounds 1–5" },
                  { icon: <Tv className="h-5 w-5" />, label: "Live Broadcast", sub: "Rounds 6–7" },
                  { icon: <Eye className="h-5 w-5" />, label: "Mandatory Camera", sub: "Every session" },
                  { icon: <Shield className="h-5 w-5" />, label: "Anti-Cheat", sub: "Full proctoring" },
                ].map((f, i) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-primary mx-auto mb-2">{f.icon}</div>
                    <p className="text-sm font-semibold text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 4 Subjects */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-accent/10 text-accent-foreground border-accent/20 mb-4">Examination System</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                4 Subjects · <span className="text-accent">45 Questions</span> · 65 Minutes
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Every student writes all 4 subjects. No selection, no optional modules. Declare a Major for enhanced ranking.</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {subjects.map((sub, i) => (
              <AnimatedSection key={sub.title} delay={i * 100}>
                <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full">
                  <div className={`h-1.5 ${i === 0 ? "bg-accent" : "bg-primary/40"}`} />
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 0 ? "bg-accent/10 text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                        {sub.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">{sub.weight}</Badge>
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{sub.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{sub.questions} questions · {sub.time}</p>
                    <p className="text-xs text-muted-foreground/80 italic">{sub.note}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Rounds Timeline */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Competition Structure</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                7 Rounds to the <span className="text-primary">Continental Crown</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-4">
            {rounds.map((round, i) => (
              <AnimatedSection key={round.num} delay={i * 80}>
                <div className={`flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 hover:shadow-lg group ${
                  round.type === "live"
                    ? "bg-gradient-to-r from-accent/5 to-accent/0 border-accent/30 hover:border-accent/50"
                    : "bg-card border-border hover:border-primary/30"
                }`}>
                  {/* Round number */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-black text-lg ${
                    round.type === "live"
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}>
                    {round.num}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-foreground">{round.title}</h3>
                      {round.type === "live" && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-1.5">
                          <Tv className="h-2.5 w-2.5 mr-1" /> LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{round.desc}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">ECOWAS Gate</p>
                    <p className={`font-bold text-sm ${round.type === "live" ? "text-accent-foreground" : "text-primary"}`}>{round.gate}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Dual-Track Scoring */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-accent/10 text-accent-foreground border-accent/20 mb-4">Scoring System</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                Dual-Track <span className="text-accent">Scoring</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Every answer counts in both tracks simultaneously. Individual brilliance and team performance are rewarded in parallel.</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection delay={0}>
              <Card className="h-full hover:shadow-xl transition-all duration-500">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <Award className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Individual Track</h3>
                  <ul className="space-y-3">
                    {[
                      "Subject raw scores scaled to 100",
                      "ECOWAS & History weighted ×1.5 for all",
                      "Major subject gets additional ×1.5 multiplier",
                      "Speed bonus for early submissions",
                      "Subject Champion medals — Gold, Silver, Bronze",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <Card className="h-full hover:shadow-xl transition-all duration-500">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent-foreground mb-6">
                    <Users className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Team Track</h3>
                  <ul className="space-y-3">
                    {[
                      "Top-10 contributions per subject per round",
                      "School level (R1–4), country level (R5–7)",
                      "Group Stage: Win=3pts, Draw=1pt, Loss=0",
                      "Debate bonus up to 50 points per match",
                      "Country team aggregate determines ranking",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Live Show Section */}
      <section className="py-20 bg-gradient-to-br from-[hsl(0,0%,8%)] via-[hsl(0,0%,10%)] to-[hsl(0,0%,12%)] text-white">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">
                <Tv className="h-3 w-3 mr-1" /> Rounds 6 & 7
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black">
                The <span className="text-accent">Live Show</span> Championship
              </h2>
              <p className="text-white/60 mt-3 max-w-xl mx-auto">
                Exams become television. 12 national teams compete in broadcast matches — Subject Duels, live debates, and audience engagement.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <Mic className="h-6 w-6" />, title: "Subject Duels", desc: "4 rounds per match — each Major representative faces their counterpart head-to-head." },
              { icon: <Users className="h-6 w-6" />, title: "Team Debates", desc: "ECOWAS & History debates judged by a panel — up to 50 bonus points per match." },
              { icon: <Eye className="h-6 w-6" />, title: "Spectator Portal", desc: "BigScreen broadcast, live feeds, school fan zones, and real-time leaderboards." },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 12 Countries */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">12 ECOWAS Nations</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                One Competition, <span className="text-primary">Twelve Nations</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {countries.map((c, i) => (
              <AnimatedSection key={c} delay={i * 50}>
                <div className="flex flex-col items-center gap-2 bg-card rounded-xl p-4 border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <FlagImg country={c} className="w-10 h-7 rounded" />
                  <p className="text-xs font-semibold text-foreground text-center">{c}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-accent via-accent/95 to-accent/80 text-accent-foreground">
        <div className="container mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Register Your School Today</h2>
            <p className="text-accent-foreground/70 max-w-lg mx-auto mb-8">
              The registration window opens 3 months before Round 1. Get your school licensed and prepare your students for the premier academic competition of West Africa.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                Register Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline" className="border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <ProgrammeSponsorsFooter
        programme="smart"
        tiers={[
          { label: "Institutional Partners", sponsors: [{ name: "ECOWAS Commission" }, { name: "AWALCO" }] },
        ]}
      />
    </Layout>
  );
};

export default SmartChallenge;
