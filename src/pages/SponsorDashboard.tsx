import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Globe, TrendingUp, Users, Calendar, CheckCircle2, Eye } from "lucide-react";

const metrics = [
  { label: "Logo impressions", value: "47,200", delta: "+31% vs projection", icon: Eye },
  { label: "Events featured", value: "12", delta: "3 flagship · 9 regional", icon: Calendar },
  { label: "Press mentions", value: "8", delta: "5 regional · 3 international", icon: Globe },
  { label: "Audience reach", value: "2.4M", delta: "Combined programme audience", icon: Users },
];

const placements = [
  { page: "Homepage — primary logo", status: "live", since: "Mar 2026" },
  { page: "Youth Innovation programme page", status: "live", since: "Mar 2026" },
  { page: "Trade & SME Forums programme page", status: "live", since: "Mar 2026" },
  { page: "Women's Empowerment programme page", status: "scheduled", since: "Apr 2026" },
  { page: "Press releases — co-branded", status: "live", since: "Mar 2026" },
  { page: "Event banners — Trade Forum Abuja", status: "scheduled", since: "Aug 2026" },
];

const eventSchedule = [
  { event: "Official Launch Ceremony", date: "5 Mar 2026", location: "Abuja", status: "complete" },
  { event: "Youth Innovation Summit", date: "May 2026", location: "Accra", status: "upcoming" },
  { event: "Trade & SME Forums", date: "Aug 2026", location: "Lagos + Dakar", status: "upcoming" },
  { event: "Women's Forum", date: "Jul 2026", location: "Freetown", status: "upcoming" },
  { event: "Cultural Festival", date: "Sep 2026", location: "Praia", status: "upcoming" },
  { event: "Anniversary Gala", date: "Nov 2026", location: "Abuja", status: "upcoming" },
];

const quarterlyProgress = [
  { quarter: "Q1 2026 (Jan–Mar)", pct: 100, status: "Complete" },
  { quarter: "Q2 2026 (Apr–Jun)", pct: 35, status: "In progress" },
  { quarter: "Q3 2026 (Jul–Sep)", pct: 0, status: "Upcoming" },
  { quarter: "Q4 2026 (Oct–Dec)", pct: 0, status: "Upcoming" },
];

export default function SponsorDashboard() {
  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              Sponsor Portal
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black">Sponsor Visibility Dashboard</h1>
            <p className="mt-3 text-primary-foreground/70 max-w-2xl">
              Real-time metrics on your sponsorship impact across the ECOWAS Parliament 25th Anniversary Programme.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-10">
        <div className="container space-y-8">
          {/* Impact metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <AnimatedSection key={m.label} delay={i * 60}>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                        <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
                      </div>
                      <p className="text-2xl font-black text-primary">{m.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{m.delta}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo placements */}
            <AnimatedSection>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">Logo Placements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {placements.map(p => (
                    <div key={p.page} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{p.page}</p>
                        <p className="text-xs text-muted-foreground">Since {p.since}</p>
                      </div>
                      <Badge variant={p.status === "live" ? "default" : "outline"} className="text-[10px]">
                        {p.status === "live" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Event schedule */}
            <AnimatedSection delay={100}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">Event Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {eventSchedule.map(e => (
                    <div key={e.event} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{e.event}</p>
                        <p className="text-xs text-muted-foreground">{e.date} · {e.location}</p>
                      </div>
                      <Badge variant={e.status === "complete" ? "default" : "secondary"} className="text-[10px]">
                        {e.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Quarterly progress */}
          <AnimatedSection>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Programme Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quarterlyProgress.map(q => (
                  <div key={q.quarter}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{q.quarter}</span>
                      <span className="text-xs text-muted-foreground">{q.status}</span>
                    </div>
                    <Progress value={q.pct} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Contact */}
          <AnimatedSection>
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="py-6">
                <h3 className="font-bold mb-2">Your Account Manager</h3>
                <p className="text-sm text-primary-foreground/75 mb-1">Mariama Camara — Sponsor Relations Manager</p>
                <p className="text-sm text-primary-foreground/75">sponsors@ecowasparliamentinitiatives.org · Quarterly touchpoint calls scheduled</p>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
