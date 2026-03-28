import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ExternalLink, FileText, ImageIcon, Mic, Mail, Clock } from "lucide-react";

const releases = [
  {
    title: "ECOWAS Parliament Launches 25th Anniversary Commemorative Programme",
    date: "2 March 2026",
    language: "EN · FR",
    type: "Press Release",
    highlight: true,
  },
  {
    title: "Youth Parliament Simulation — Call for Delegates Now Open",
    date: "20 March 2026",
    language: "EN",
    type: "Media Notice",
    highlight: false,
  },
  {
    title: "Year-Long Programme of Events — Media Announcement",
    date: "5 March 2026",
    language: "EN · FR",
    type: "Programme",
    highlight: false,
  },
];

const spokespeople = [
  {
    name: "Speaker of the ECOWAS Parliament",
    title: "Right Honourable [Name]",
    note: "Available for broadcast interviews with advance notice. Interview requests via media@ecowasparliamentinitiatives.org",
    initials: "SP",
    colour: "bg-primary/10 text-primary",
  },
  {
    name: "Adaora Okafor",
    title: "Programme Director — 25th Anniversary",
    note: "Available for background briefings, programme detail, and logistics questions.",
    initials: "AO",
    colour: "bg-primary/10 text-primary",
  },
  {
    name: "Ibrahim Traore",
    title: "Communications Director",
    note: "Primary media contact for accreditation, statements, and photography access.",
    initials: "IT",
    colour: "bg-violet-100 text-violet-700",
  },
];

const keyFacts = [
  { label: "Founded",             value: "2001" },
  { label: "Member states",       value: "12" },
  { label: "Anniversary year",    value: "2026" },
  { label: "Programme pillars",   value: "7" },
  { label: "Events across 2026",  value: "40+" },
  { label: "Countries reached",   value: "All 12 ECOWAS Parliament states" },
  { label: "Programme partners",  value: "3 implementing partners" },
  { label: "Sponsors onboard",    value: "8 (Gold / Silver / Bronze)" },
];

const eventCalendar = [
  { month:"March 2026",    event:"Opening Ceremony & Launch",              city:"Abuja, Nigeria"      },
  { month:"May 2026",      event:"Youth Innovation Summit",                city:"Accra, Ghana"        },
  { month:"June 2026",     event:"Trade & SME Forums",                     city:"Lagos + Dakar"       },
  { month:"July 2026",     event:"Women's Empowerment Forum",              city:"Freetown, Sierra Leone"},
  { month:"Aug–Sep 2026",  event:"Cultural Festivals & Civic Campaigns",   city:"Multiple capitals"   },
  { month:"October 2026",  event:"Youth Parliament Simulation",            city:"Abuja, Nigeria"      },
  { month:"November 2026", event:"Parliamentary Excellence Awards",        city:"Abuja, Nigeria"      },
  { month:"December 2026", event:"Anniversary Gala Dinner — Closing",      city:"Abuja, Nigeria"      },
];

const assetPacks = [
  {
    icon: ImageIcon,
    title: "Logo pack",
    desc: "ECOWAS Parliament + 25th Anniversary logos in PNG, SVG, and EPS. Light and dark variants.",
    size: "4.2 MB",
    restricted: false,
  },
  {
    icon: ImageIcon,
    title: "Photography — events",
    desc: "High-resolution event photographs from Q1 2026. Rights cleared for editorial use with credit.",
    size: "128 MB",
    restricted: false,
  },
  {
    icon: FileText,
    title: "Factsheet — programme overview",
    desc: "One-page factsheet covering the programme scope, goals, and implementing partners. Editable PDF.",
    size: "320 KB",
    restricted: false,
  },
  {
    icon: FileText,
    title: "Speaker biography — Programme Director",
    desc: "Full biography of Adaora Okafor for programme notes and broadcast credits.",
    size: "85 KB",
    restricted: false,
  },
  {
    icon: FileText,
    title: "ECOWAS Vision 2050 summary — media brief",
    desc: "Two-page editorial summary of Vision 2050 for background context in reporting.",
    size: "210 KB",
    restricted: false,
  },
  {
    icon: ImageIcon,
    title: "Branded graphics — social & print",
    desc: "25th anniversary branded graphics for social media, print headers, and broadcast lower-thirds.",
    size: "18 MB",
    restricted: false,
  },
];

export default function MediaKit() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
              Press & Media
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black">Media Kit</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              Resources for journalists, broadcasters, and content creators covering the ECOWAS Parliament 25th Anniversary programme. Logos, photography, press releases, spokespeople, and key facts.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button variant="secondary" className="gap-2">
                <Download className="h-4 w-4" /> Full media pack (ZIP, 145 MB)
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                <Mail className="h-4 w-4" /> media@ecowasparliament25.org
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Accreditation notice */}
      <section className="py-5 bg-amber-50 border-y border-amber-200">
        <div className="container">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Media accreditation:</strong> Applications are open for all 2026 events. Email{" "}
              <a href="mailto:media@ecowasparliament25.org" className="underline">media@ecowasparliament25.org</a>{" "}
              at least 5 working days before each event. Include your outlet name, assignment, and credential number.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-14">

          {/* Key facts */}
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-6">Key facts at a glance</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyFacts.map(f => (
                <div key={f.label} className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-2xl font-black text-primary">{f.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{f.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Press releases */}
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-6">Press releases & statements</h2>
            <div className="space-y-3">
              {releases.map(r => (
                <div key={r.title}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-shadow hover:shadow-sm ${
                    r.highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                  }`}>
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug">{r.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                      <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{r.language}</Badge>
                      {r.highlight && <Badge className="text-[10px]">Latest</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <ExternalLink className="h-3 w-3" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <Download className="h-3 w-3" /> PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Event calendar */}
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-6">2026 event calendar — forward planner</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left pb-3 font-semibold text-muted-foreground pr-6">Month</th>
                    <th className="text-left pb-3 font-semibold text-muted-foreground pr-6">Event</th>
                    <th className="text-left pb-3 font-semibold text-muted-foreground">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {eventCalendar.map((e, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-6 font-medium text-primary whitespace-nowrap">{e.month}</td>
                      <td className="py-3 pr-6">{e.event}</td>
                      <td className="py-3 text-muted-foreground">{e.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Dates and locations subject to confirmation. Subscribe to media updates at media@ecowasparliament25.org
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Spokespeople */}
            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6">Approved spokespeople</h2>
              <div className="space-y-4">
                {spokespeople.map(s => (
                  <Card key={s.name}>
                    <CardContent className="pt-4">
                      <div className="flex gap-4">
                        <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold flex-shrink-0 ${s.colour}`}>
                          {s.initials}
                        </span>
                        <div>
                          <p className="font-bold text-sm">{s.name}</p>
                          <p className="text-xs text-primary font-medium mb-2">{s.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{s.note}</p>
                          <Button size="sm" variant="outline" className="mt-2 h-7 text-xs gap-1">
                            <Mic className="h-3 w-3" /> Request interview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AnimatedSection>

            {/* Asset downloads */}
            <AnimatedSection delay={100}>
              <h2 className="text-2xl font-bold mb-6">Downloadable assets</h2>
              <div className="space-y-3">
                {assetPacks.map(a => {
                  const Icon = a.icon;
                  return (
                    <div key={a.title}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground">{a.size}</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button className="w-full mt-4 gap-2" variant="outline">
                <Download className="h-4 w-4" /> Download everything (ZIP)
              </Button>
            </AnimatedSection>
          </div>

          {/* Media contact card */}
          <AnimatedSection>
            <Card className="bg-gradient-hero text-primary-foreground border-0 overflow-hidden">
              <CardContent className="py-8 px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                  <div>
                    <CardTitle className="text-xl text-primary-foreground mb-2">Media contact</CardTitle>
                    <p className="text-primary-foreground/75 text-sm max-w-md">
                      For urgent enquiries, press accreditation, interview requests, or embargoed briefings, contact our Communications Director directly.
                    </p>
                    <p className="text-primary-foreground font-semibold mt-3">Ibrahim Traore — Communications Director</p>
                    <p className="text-primary-foreground/75 text-sm">media@ecowasparliament25.org · Response within 24hrs</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" className="gap-2 whitespace-nowrap">
                      <Mail className="h-4 w-4" /> Email media team
                    </Button>
                    <Button variant="outline" className="gap-2 whitespace-nowrap border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                      <Download className="h-4 w-4" /> Full media pack
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

        </div>
      </section>
    </Layout>
  );
}
