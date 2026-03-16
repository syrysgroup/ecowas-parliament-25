import { useState } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HemicycleChart, { COUNTRIES } from "@/components/parliament/HemicycleChart";
import CountryDelegationCard from "@/components/parliament/CountryDelegationCard";
import NominationTimeline from "@/components/parliament/NominationTimeline";
import ParliamentActionModal from "@/components/parliament/ParliamentActionModal";
import { Building2, Users, Globe, Target, Calendar, BookOpen, Scale, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const delegationStatuses: Record<string, { status: "open" | "closed" | "coming_soon"; filled: number }> = {
  NG: { status: "open", filled: 12 },
  GH: { status: "open", filled: 3 },
  CI: { status: "coming_soon", filled: 0 },
  GN: { status: "coming_soon", filled: 0 },
  SN: { status: "open", filled: 2 },
  BJ: { status: "coming_soon", filled: 0 },
  BF: { status: "coming_soon", filled: 0 },
  CV: { status: "closed", filled: 5 },
  GM: { status: "coming_soon", filled: 0 },
  GW: { status: "coming_soon", filled: 0 },
  LR: { status: "open", filled: 1 },
  ML: { status: "coming_soon", filled: 0 },
  NE: { status: "coming_soon", filled: 0 },
  SL: { status: "open", filled: 2 },
  TG: { status: "coming_soon", filled: 0 },
};

const objectives = [
  { icon: Building2, title: "Simulate Parliament", text: "Full parliamentary session with real procedures, motions, and debates." },
  { icon: Users, title: "Youth Representation", text: "115 youth honourable members representing all 15 ECOWAS states." },
  { icon: Scale, title: "Parliamentary Skills", text: "Build legislative drafting, debate, and civic governance skills." },
  { icon: Target, title: "Policy Advocacy", text: "Develop youth-driven policy recommendations on regional issues." },
  { icon: Globe, title: "Regional Unity", text: "Foster cross-border understanding and Pan-African solidarity." },
  { icon: MessageSquare, title: "Youth Voice", text: "Amplify the perspectives of young West Africans in governance." },
];

const agenda = [
  { time: "Day 1 — Opening", title: "Opening Ceremony & Inaugural Address", desc: "Welcome by the Rt. Hon. Speaker, swearing-in of youth honourable members, keynote on youth in governance." },
  { time: "Day 1 — Afternoon", title: "Committee Formations", desc: "Formation of standing committees: Trade & Economy, Peace & Security, Social Affairs, Agriculture & Environment." },
  { time: "Day 2 — Morning", title: "Committee Deliberations", desc: "Committee sessions to draft resolutions on key regional challenges affecting youth." },
  { time: "Day 2 — Afternoon", title: "Plenary Debate", desc: "Full chamber debate on committee reports. Motions, amendments, and voting on youth policy resolutions." },
  { time: "Day 3", title: "Closing & Declaration", desc: "Adoption of the Abidjan Youth Declaration, closing ceremony, and launch of the ECOWAS Youth Parliament vision." },
];

const Parliament = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"apply" | "nominate">("apply");
  const totalSeats = COUNTRIES.reduce((s, c) => s + c.seats, 0);
  const totalFilled = Object.values(delegationStatuses).reduce((s, d) => s + d.filled, 0);

  const openApplicationModal = (tab: "apply" | "nominate" = "apply") => {
    setModalTab(tab);
    setModalOpen(true);
  };

  return (
    <Layout>
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/announcement/15.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/70" />
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[200, 280, 360].map((r) => (
            <svg key={r} className="absolute bottom-0 left-1/2 -translate-x-1/2" width={r * 2} height={r} viewBox={`0 0 ${r * 2} ${r}`}>
              <path d={`M0,${r} A${r},${r} 0 0,1 ${r * 2},${r}`} fill="none" stroke="white" strokeWidth="2" />
            </svg>
          ))}
        </div>
        <div className="container relative z-10 py-20">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Building2 className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-accent font-bold text-sm uppercase tracking-wider">
                Flagship Programme
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground leading-tight max-w-3xl">
              Simulated ECOWAS<br />Youth Parliament
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              Giving young people a seat at the table — launching the Rt. Hon. Speaker's vision of an ECOWAS Youth Parliament with {totalSeats} seats across 15 nations.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { label: "Total Seats", value: totalSeats.toString(), icon: Users },
                { label: "Member States", value: "15", icon: Globe },
                { label: "Nominated", value: totalFilled.toString(), icon: Target },
                { label: "Session Date", value: "May 2026", icon: Calendar },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-primary-foreground/20">
                  <stat.icon className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-2xl font-black text-primary-foreground">{stat.value}</div>
                    <div className="text-xs text-primary-foreground/60">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <div className="text-center space-y-4">
              <BookOpen className="h-8 w-8 text-primary mx-auto" />
              <h2 className="text-2xl md:text-3xl font-black text-foreground">The Speaker's Vision</h2>
              <blockquote className="text-lg md:text-xl text-muted-foreground italic leading-relaxed border-l-4 border-primary pl-6 text-left">
                "In May, the story reaches the parliamentary chamber itself. A Simulated ECOWAS Parliament gives young people a seat at the table, launching the vision of a future ECOWAS Youth Parliament. What begins as simulation becomes aspiration — documented through youth reports in Abidjan and carried forward to Abuja."
              </blockquote>
              <p className="text-muted-foreground">
                This initiative represents a cornerstone of the Parliament's commitment to intergenerational leadership and youth empowerment across the ECOWAS region.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">Programme Objectives</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {objectives.map((obj, i) => (
              <AnimatedSection key={obj.title} delay={i * 80}>
                <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <obj.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-card-foreground mb-1">{obj.title}</h3>
                  <p className="text-sm text-muted-foreground">{obj.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <HemicycleChart />
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              Country Delegations
            </h2>
            <p className="mt-2 text-muted-foreground">
              Nomination status and seat allocation for each ECOWAS member state.
            </p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COUNTRIES.map((country, i) => {
              const ds = delegationStatuses[country.code] || { status: "coming_soon" as const, filled: 0 };
              return (
                <AnimatedSection key={country.code} delay={i * 50}>
                  <CountryDelegationCard
                    country={country}
                    status={ds.status}
                    filled={ds.filled}
                  />
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <NominationTimeline onApplyClick={() => openApplicationModal("apply")} />
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              Parliamentary Session Agenda
            </h2>
          </AnimatedSection>
          <div className="space-y-4">
            {agenda.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 80}>
                <div className="flex gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
                  <div className="shrink-0 w-28 text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.time}</span>
                  </div>
                  <div className="border-l-2 border-primary/20 pl-4">
                    <h4 className="font-bold text-card-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-black">
              Be Part of History
            </h2>
            <p className="mt-3 text-primary-foreground/70 max-w-xl mx-auto">
              Represent your country in the first-ever Simulated ECOWAS Youth Parliament. Applications are now open for youth aged 18–35.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button size="lg" variant="secondary" className="text-base px-8" onClick={() => openApplicationModal("apply")}>
                Apply Now
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => openApplicationModal("nominate")}>
                Nominate a Youth
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <ParliamentActionModal open={modalOpen} onOpenChange={setModalOpen} initialTab={modalTab} />
    </Layout>
  );
};

export default Parliament;
