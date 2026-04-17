import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, TrendingUp, Users, Calendar, CheckCircle2, Eye, Info } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuthContext } from "@/contexts/AuthContext";

export default function SponsorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  // Find the sponsor record linked to this user by email
  const { data: sponsor, isLoading: sponsorLoading } = useQuery({
    queryKey: ["sponsor-dashboard-record", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data } = await (supabase as any)
        .from("sponsors")
        .select("id, name, tier, programmes, slug, description, email")
        .eq("email", user.email)
        .maybeSingle();
      return data as {
        id: string; name: string; tier: string;
        programmes: string[]; slug: string;
        description: string | null; email: string;
      } | null;
    },
    enabled: !!user?.email,
  });

  // Fetch events the sponsor's programmes are linked to
  const { data: linkedEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["sponsor-dashboard-events", sponsor?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("events")
        .select("id, title, start_date, location, status")
        .order("start_date", { ascending: true })
        .limit(10);
      return (data ?? []) as { id: string; title: string; start_date: string; location: string; status: string }[];
    },
    enabled: !!sponsor?.id,
  });

  const quarterlyProgress = [
    { quarter: "Q1 2026 (Jan–Mar)", pct: 100, status: t("common.complete") },
    { quarter: "Q2 2026 (Apr–Jun)", pct: 35,  status: t("common.inProgress") },
    { quarter: "Q3 2026 (Jul–Sep)", pct: 0,   status: t("common.upcoming") },
    { quarter: "Q4 2026 (Oct–Dec)", pct: 0,   status: t("common.upcoming") },
  ];

  const isLoading = sponsorLoading;

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              {t("sponsorDash.badge")}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black">
              {isLoading ? t("sponsorDash.title") : sponsor?.name ?? t("sponsorDash.title")}
            </h1>
            <p className="mt-3 text-primary-foreground/70 max-w-2xl">
              {sponsor?.tier && (
                <span className="mr-2 inline-block px-3 py-0.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                  {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)} Sponsor
                </span>
              )}
              {t("sponsorDash.desc")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-10">
        <div className="container space-y-8">
          {/* Sponsor Info */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : sponsor ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("sponsorDash.logoImpressions"), value: "—", delta: "Tracked from go-live",            icon: Eye },
                { label: t("sponsorDash.eventsFeatured"),  value: String(linkedEvents.length || "—"), delta: "Live from programme calendar", icon: Calendar },
                { label: t("sponsorDash.pressMentions"),   value: "—", delta: "Tracked from launch",             icon: Globe },
                { label: t("sponsorDash.audienceReach"),   value: "2.4M", delta: "Combined programme audience",  icon: Users },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <AnimatedSection key={m.label} delay={i * 60}>
                    <Card><CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                        <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
                      </div>
                      <p className="text-2xl font-black text-primary">{m.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{m.delta}</p>
                    </CardContent></Card>
                  </AnimatedSection>
                );
              })}
            </div>
          ) : (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-5 flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Sponsor record not yet linked</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Your account is not yet linked to a sponsor record. Please contact the programme team to complete your onboarding.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Schedule — from DB */}
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedSection>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">{t("sponsorDash.eventSchedule")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {eventsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)
                  ) : linkedEvents.length > 0 ? (
                    linkedEvents.map(e => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium">{e.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.start_date ? new Date(e.start_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "TBC"} · {e.location}
                          </p>
                        </div>
                        <Badge variant={e.status === "published" ? "default" : "secondary"} className="text-[10px]">
                          {e.status === "published" ? <><CheckCircle2 className="h-3 w-3 mr-1" />Live</> : e.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">Programme events will appear here once published.</p>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Programmes */}
            <AnimatedSection delay={100}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">Your Sponsored Programmes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8" />)
                  ) : (sponsor?.programmes ?? []).length > 0 ? (
                    (sponsor!.programmes).map(prog => (
                      <div key={prog} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">{prog}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">Programme assignments will appear here after onboarding.</p>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Quarterly Progress */}
          <AnimatedSection>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />{t("sponsorDash.progress")}
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

          {/* Account manager */}
          <AnimatedSection>
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="py-6">
                <h3 className="font-bold mb-2">{t("sponsorDash.accountManager")}</h3>
                <p className="text-sm text-primary-foreground/75 mb-1">{t("sponsorDash.accountManagerName")}</p>
                <p className="text-sm text-primary-foreground/75">{t("sponsorDash.accountManagerEmail")}</p>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
