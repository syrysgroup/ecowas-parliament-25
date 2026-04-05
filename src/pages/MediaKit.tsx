import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ExternalLink, FileText, ImageIcon, Mic, Mail, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function MediaKit() {
  const { t } = useTranslation();

  const releases = [
    { title: t("mediaKit.release1.title"), date: "2 March 2026", language: "EN · FR", type: t("mediaKit.release1.type"), highlight: true },
    { title: t("mediaKit.release2.title"), date: "20 March 2026", language: "EN", type: t("mediaKit.release2.type"), highlight: false },
    { title: t("mediaKit.release3.title"), date: "5 March 2026", language: "EN · FR", type: t("mediaKit.release3.type"), highlight: false },
  ];

  const spokespeople = [
    { name: t("mediaKit.spokesperson1.name"), title: t("mediaKit.spokesperson1.title"), note: t("mediaKit.spokesperson1.note"), initials: "SP", colour: "bg-primary/10 text-primary" },
    { name: t("mediaKit.spokesperson2.name"), title: t("mediaKit.spokesperson2.title"), note: t("mediaKit.spokesperson2.note"), initials: "AO", colour: "bg-primary/10 text-primary" },
    { name: t("mediaKit.spokesperson3.name"), title: t("mediaKit.spokesperson3.title"), note: t("mediaKit.spokesperson3.note"), initials: "IT", colour: "bg-violet-100 text-violet-700" },
  ];

  const keyFacts = [
    { label: t("mediaKit.fact.founded"), value: t("mediaKit.fact.foundedVal") },
    { label: t("mediaKit.fact.memberStates"), value: t("mediaKit.fact.memberStatesVal") },
    { label: t("mediaKit.fact.anniversary"), value: t("mediaKit.fact.anniversaryVal") },
    { label: t("mediaKit.fact.pillars"), value: t("mediaKit.fact.pillarsVal") },
    { label: t("mediaKit.fact.events"), value: t("mediaKit.fact.eventsVal") },
    { label: t("mediaKit.fact.countries"), value: t("mediaKit.fact.countriesVal") },
    { label: t("mediaKit.fact.partners"), value: t("mediaKit.fact.partnersVal") },
    { label: t("mediaKit.fact.sponsors"), value: t("mediaKit.fact.sponsorsVal") },
  ];

  const eventCalendar = [
    { month: "March 2026", event: t("mediaKit.cal1.event"), city: "Abuja, Nigeria" },
    { month: "May 2026", event: t("mediaKit.cal2.event"), city: "Accra, Ghana" },
    { month: "June 2026", event: t("mediaKit.cal3.event"), city: "Lagos + Dakar" },
    { month: "July 2026", event: t("mediaKit.cal4.event"), city: "Freetown, Sierra Leone" },
    { month: "Aug–Sep 2026", event: t("mediaKit.cal5.event"), city: "Multiple capitals" },
    { month: "October 2026", event: t("mediaKit.cal6.event"), city: "Abuja, Nigeria" },
    { month: "November 2026", event: t("mediaKit.cal7.event"), city: "Abuja, Nigeria" },
    { month: "December 2026", event: t("mediaKit.cal8.event"), city: "Abuja, Nigeria" },
  ];

  const assetPacks = [
    { icon: ImageIcon, title: t("mediaKit.asset1.title"), desc: t("mediaKit.asset1.desc"), size: "4.2 MB" },
    { icon: ImageIcon, title: t("mediaKit.asset2.title"), desc: t("mediaKit.asset2.desc"), size: "128 MB" },
    { icon: FileText, title: t("mediaKit.asset3.title"), desc: t("mediaKit.asset3.desc"), size: "320 KB" },
    { icon: FileText, title: t("mediaKit.asset4.title"), desc: t("mediaKit.asset4.desc"), size: "85 KB" },
    { icon: FileText, title: t("mediaKit.asset5.title"), desc: t("mediaKit.asset5.desc"), size: "210 KB" },
    { icon: ImageIcon, title: t("mediaKit.asset6.title"), desc: t("mediaKit.asset6.desc"), size: "18 MB" },
  ];

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20"><div className="container"><AnimatedSection>
        <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">{t("mediaKit.badge")}</Badge>
        <h1 className="text-4xl md:text-5xl font-black">{t("mediaKit.heroTitle")}</h1>
        <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("mediaKit.heroDesc")}</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="secondary" className="gap-2"><Download className="h-4 w-4" /> {t("mediaKit.fullPack")}</Button>
          <Button variant="secondary" className="gap-2 bg-primary-foreground/15 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/25"><Mail className="h-4 w-4" /> media@ecowasparliamentinitiatives.org</Button>
        </div>
      </AnimatedSection></div></section>

      <section className="py-5 bg-amber-50 border-y border-amber-200"><div className="container"><div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800"><strong>{t("mediaKit.accreditation")}</strong> {t("mediaKit.accreditationDesc")}</p>
      </div></div></section>

      <section className="py-16"><div className="container space-y-14">
        <AnimatedSection>
          <h2 className="text-2xl font-bold mb-6">{t("mediaKit.keyFacts")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyFacts.map(f => (<div key={f.label} className="p-4 rounded-xl bg-muted/50 border border-border"><p className="text-2xl font-black text-primary">{f.value}</p><p className="text-sm text-muted-foreground mt-1">{f.label}</p></div>))}
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <h2 className="text-2xl font-bold mb-6">{t("mediaKit.pressReleases")}</h2>
          <div className="space-y-3">
            {releases.map(r => (
              <div key={r.title} className={`flex items-center gap-4 p-4 rounded-xl border transition-shadow hover:shadow-sm ${r.highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0"><FileText className="h-5 w-5 text-destructive" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                    <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{r.language}</Badge>
                    {r.highlight && <Badge className="text-[10px]">{t("mediaKit.latest")}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><ExternalLink className="h-3 w-3" /> {t("mediaKit.view")}</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="h-3 w-3" /> PDF</Button>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <h2 className="text-2xl font-bold mb-6">{t("mediaKit.eventCalendar")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-border">
                <th className="text-left pb-3 font-semibold text-muted-foreground pr-6">{t("mediaKit.month")}</th>
                <th className="text-left pb-3 font-semibold text-muted-foreground pr-6">{t("mediaKit.event")}</th>
                <th className="text-left pb-3 font-semibold text-muted-foreground">{t("mediaKit.location")}</th>
              </tr></thead>
              <tbody>{eventCalendar.map((e, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-6 font-medium text-primary whitespace-nowrap">{e.month}</td>
                  <td className="py-3 pr-6">{e.event}</td>
                  <td className="py-3 text-muted-foreground">{e.city}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">{t("mediaKit.calendarNote")}</p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-10">
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-6">{t("mediaKit.spokespeople")}</h2>
            <div className="space-y-4">
              {spokespeople.map(s => (
                <Card key={s.name}><CardContent className="pt-4"><div className="flex gap-4">
                  <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold flex-shrink-0 ${s.colour}`}>{s.initials}</span>
                  <div>
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className="text-xs text-primary font-medium mb-2">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.note}</p>
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs gap-1"><Mic className="h-3 w-3" /> {t("mediaKit.requestInterview")}</Button>
                  </div>
                </div></CardContent></Card>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h2 className="text-2xl font-bold mb-6">{t("mediaKit.assets")}</h2>
            <div className="space-y-3">
              {assetPacks.map(a => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Icon className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{a.title}</p><p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.desc}</p></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground">{a.size}</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="h-3 w-3" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full mt-4 gap-2" variant="outline"><Download className="h-4 w-4" /> {t("mediaKit.downloadAll")}</Button>
          </AnimatedSection>
        </div>

        <AnimatedSection>
          <Card className="bg-gradient-hero text-primary-foreground border-0 overflow-hidden"><CardContent className="py-8 px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div>
                <CardTitle className="text-xl text-primary-foreground mb-2">{t("mediaKit.mediaContact")}</CardTitle>
                <p className="text-primary-foreground/75 text-sm max-w-md">{t("mediaKit.mediaContactDesc")}</p>
                <p className="text-primary-foreground font-semibold mt-3">{t("mediaKit.contactName")}</p>
                <p className="text-primary-foreground/75 text-sm">{t("mediaKit.contactResponse")}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" className="gap-2 whitespace-nowrap"><Mail className="h-4 w-4" /> {t("mediaKit.emailMediaTeam")}</Button>
                <Button variant="secondary" className="gap-2 whitespace-nowrap bg-primary-foreground/15 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/25"><Download className="h-4 w-4" /> {t("mediaKit.fullMediaPack")}</Button>
              </div>
            </div>
          </CardContent></Card>
        </AnimatedSection>
      </div></section>
    </Layout>
  );
}
