import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HemicycleChart from "@/components/parliament/HemicycleChart";
import CountryDelegationCard from "@/components/parliament/CountryDelegationCard";
import NominationTimeline from "@/components/parliament/NominationTimeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Target, Calendar, Users, MapPin } from "lucide-react";

const delegations = [
  { name: "Nigeria", flag: "🇳🇬", seats: 35, status: "open" as const, filled: 12 },
  { name: "Ghana", flag: "🇬🇭", seats: 8, status: "open" as const, filled: 5 },
  { name: "Côte d'Ivoire", flag: "🇨🇮", seats: 7, status: "coming-soon" as const, filled: 0 },
  { name: "Senegal", flag: "🇸🇳", seats: 6, status: "open" as const, filled: 3 },
  { name: "Guinea", flag: "🇬🇳", seats: 6, status: "coming-soon" as const, filled: 0 },
  { name: "Benin", flag: "🇧🇯", seats: 5, status: "closed" as const, filled: 5 },
  { name: "Cape Verde", flag: "🇨🇻", seats: 5, status: "coming-soon" as const, filled: 0 },
  { name: "Gambia", flag: "🇬🇲", seats: 5, status: "open" as const, filled: 2 },
  { name: "Guinea-Bissau", flag: "🇬🇼", seats: 5, status: "coming-soon" as const, filled: 0 },
  { name: "Liberia", flag: "🇱🇷", seats: 5, status: "open" as const, filled: 1 },
  { name: "Sierra Leone", flag: "🇸🇱", seats: 5, status: "coming-soon" as const, filled: 0 },
  { name: "Togo", flag: "🇹🇬", seats: 5, status: "open" as const, filled: 3 },
  { name: "Burkina Faso", flag: "🇧🇫", seats: 5, status: "coming-soon" as const, filled: 0 },
  { name: "Mali", flag: "🇲🇱", seats: 5, status: "coming-soon" as const, filled: 0 },
  { name: "Niger", flag: "🇳🇪", seats: 3, status: "coming-soon" as const, filled: 0 },
];

const objectives = [
  "Organise a Simulated ECOWAS Parliament session for young people",
  "Launch the Rt. Hon. Speaker's vision of a future ECOWAS Youth Parliament",
  "Document proceedings through youth reports and publications",
  "Build parliamentary skills and civic knowledge among young participants",
  "Create a pathway from simulation to institutional youth engagement",
];

const agenda = [
  { title: "Opening Ceremony & Speaker's Address", time: "Day 1 — Morning" },
  { title: "Committee Sessions: Trade & Economy", time: "Day 1 — Afternoon" },
  { title: "Committee Sessions: Peace & Security", time: "Day 2 — Morning" },
  { title: "Plenary Debate: Youth Policy Framework", time: "Day 2 — Afternoon" },
  { title: "Resolution Drafting & Voting", time: "Day 3 — Morning" },
  { title: "Closing Ceremony & Delegate Awards", time: "Day 3 — Afternoon" },
];

const Parliament = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full border border-primary-foreground/20" />
          <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full border border-primary-foreground/10" />
        </div>
        <div className="container relative">
          <AnimatedSection>
            <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-6 -ml-3">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-ecowas-red/20 text-ecowas-red">
                <Building2 className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">
                Programme Pillar
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Simulated Youth<br />Parliament
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              Giving young people a seat at the table — launching the ECOWAS Youth Parliament vision.
            </p>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection delay={200}>
            <div className="flex flex-wrap gap-8 mt-10">
              {[
                { icon: <Users className="h-5 w-5" />, value: "115", label: "Total Seats" },
                { icon: <MapPin className="h-5 w-5" />, value: "15", label: "Countries" },
                { icon: <Calendar className="h-5 w-5" />, value: "May 2026", label: "Target Date" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-foreground/10">{stat.icon}</div>
                  <div>
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs text-primary-foreground/50">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Overview & Vision */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">Overview & Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              In May, the story reaches the parliamentary chamber itself. A Simulated ECOWAS Parliament gives young people a seat at the table, launching the Rt. Hon. Speaker's vision of a future ECOWAS Youth Parliament. What begins as simulation becomes aspiration, documented through youth reports in Abidjan and carried forward to Abuja. This initiative represents a cornerstone of the Parliament's commitment to intergenerational leadership.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Hemicycle Chart */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <AnimatedSection className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Interactive Seating Chart</h2>
            <p className="text-muted-foreground mt-1">Hover over seats to explore country delegations</p>
          </AnimatedSection>
          <HemicycleChart />
        </div>
      </section>

      {/* Country Delegations */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Country Delegations</h2>
            <p className="text-muted-foreground mt-1">Status of nominations across all 15 member states</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {delegations.map((d, i) => (
              <AnimatedSection key={d.name} delay={i * 50}>
                <CountryDelegationCard {...d} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Nomination Process */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Nomination & Voting Process</h2>
            <p className="text-muted-foreground mt-1">How youth representatives are selected</p>
          </AnimatedSection>
          <NominationTimeline />
          <AnimatedSection delay={400} className="mt-8 text-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Apply as Youth Representative
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Programme Agenda */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Programme Agenda</h2>
            <p className="text-muted-foreground mt-1">Key sessions planned for the simulated parliament</p>
          </AnimatedSection>
          <div className="space-y-3">
            {agenda.map((item, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
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
                  <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{obj}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Parliament;
