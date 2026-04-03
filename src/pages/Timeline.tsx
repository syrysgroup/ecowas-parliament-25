import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar, MapPin, Users, Flag, Trophy, Lightbulb, TrendingUp,
  Heart, Megaphone, Palette, Building2, Award, Star, Sparkles,
} from "lucide-react";

const programmeMap: Record<string, { label: string; to: string; color: string; borderColor: string; icon: React.ReactNode }> = {
  youth: { label: "Youth Innovation", to: "/programmes/youth", color: "bg-accent/10 text-accent", borderColor: "border-l-accent", icon: <Lightbulb className="h-3.5 w-3.5" /> },
  trade: { label: "Trade & SME", to: "/programmes/trade", color: "bg-primary/10 text-primary", borderColor: "border-l-primary", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  women: { label: "Women's Empowerment", to: "/programmes/women", color: "bg-secondary/10 text-secondary", borderColor: "border-l-secondary", icon: <Heart className="h-3.5 w-3.5" /> },
  civic: { label: "Civic Education", to: "/programmes/civic", color: "bg-ecowas-blue/10 text-ecowas-blue", borderColor: "border-l-ecowas-blue", icon: <Megaphone className="h-3.5 w-3.5" /> },
  culture: { label: "Culture & Creativity", to: "/programmes/culture", color: "bg-ecowas-lime/10 text-ecowas-lime", borderColor: "border-l-ecowas-lime", icon: <Palette className="h-3.5 w-3.5" /> },
  parliament: { label: "Youth Parliament", to: "/programmes/parliament", color: "bg-ecowas-red/10 text-ecowas-red", borderColor: "border-l-ecowas-red", icon: <Building2 className="h-3.5 w-3.5" /> },
  awards: { label: "AWALCO Parliamentary Awards", to: "/programmes/awards", color: "bg-accent/10 text-accent", borderColor: "border-l-accent", icon: <Award className="h-3.5 w-3.5" /> },
  general: { label: "General", to: "/about", color: "bg-muted text-muted-foreground", borderColor: "border-l-muted-foreground", icon: <Star className="h-3.5 w-3.5" /> },
};

const events = [
  {
    month: "January 2026",
    country: "🇳🇬 Nigeria",
    city: "Abuja",
    title: "Programme Kick-off & Strategic Planning",
    description: "High-level coordination sessions bring together programme directors, national focal points, and ECOWAS officials to finalise the year-long implementation roadmap. Partnership agreements are signed and the programme secretariat is established in Abuja.",
    programme: "general",
    deliverables: ["Implementation roadmap finalised", "Secretariat established", "Partnership MOUs signed"],
    highlight: false,
  },
  {
    month: "February 2026",
    country: "🇳🇬 Nigeria",
    city: "Abuja",
    title: "Media Partnerships & Brand Launch",
    description: "Engagement with continental and regional media houses to build the communications infrastructure. Brand identity, social media channels, and a digital toolkit are unveiled. Journalist training workshops prepare a cohort of reporters to cover the anniversary programme.",
    programme: "general",
    deliverables: ["Brand identity unveiled", "Media partnership agreements", "Digital toolkit launched"],
    highlight: false,
  },
  {
    month: "March 2026",
    country: "🇳🇬 Nigeria",
    city: "Abuja",
    title: "Official Launch & Awards Nominations Open",
    description: "The 25th Anniversary programme is officially launched at a press conference at Onomo Allure Abuja AATC Hotel on 5th March, with key stakeholders, diplomats, and programme champions in attendance. Simultaneously, nominations for the inaugural AWALCO Parliamentary Awards open across all 12 Member States.",
    programme: "awards",
    deliverables: ["Public launch event", "Awards nominations portal opens", "Stakeholder reception"],
    highlight: true,
  },
  {
    month: "April 2026",
    country: "🇬🇭 Ghana / 🇸🇳 Senegal",
    city: "Accra & Dakar",
    title: "ECOWAS Smart Challenge & Media Training Forum",
    description: "National youth innovation competitions begin in Ghana and Senegal, with hundreds of young entrepreneurs pitching solutions to regional challenges. In Dakar, a regional media training forum gathers journalists from 12 countries to deepen coverage of parliamentary governance.",
    programme: "youth",
    deliverables: ["National competitions launched", "Media training for 50+ journalists", "Innovation track registrations"],
    highlight: true,
  },
  {
    month: "May 2026",
    country: "🇨🇮 Côte d'Ivoire",
    city: "Abidjan",
    title: "Simulated Youth Parliament",
    description: "Over 150 young people from across West Africa take their seats in a simulated ECOWAS Parliament session in Abidjan. Delegates debate real policy issues — trade integration, climate action, digital rights — and produce resolutions presented to the Rt. Hon. Speaker. This event launches the vision of a permanent ECOWAS Youth Parliament.",
    programme: "parliament",
    deliverables: ["150+ youth delegates", "Policy resolutions adopted", "Youth Parliament roadmap"],
    highlight: true,
  },
  {
    month: "June 2026",
    country: "Multiple States",
    city: "Regional",
    title: "ECOWAS Caravan Phase 1 — Community Outreach",
    description: "The ECOWAS Civic Education Caravan launches its first phase, travelling through communities in Nigeria, Ghana, and Senegal. Mobile exhibition units visit airports, universities, markets, and transit hubs, engaging citizens on the role and impact of the ECOWAS Parliament through interactive displays and town halls.",
    programme: "civic",
    deliverables: ["3 countries covered", "Community town halls", "Interactive exhibitions"],
    highlight: false,
  },
  {
    month: "July 2026",
    country: "🇹🇬 Togo / 🇸🇱 Sierra Leone",
    city: "Lomé & Freetown",
    title: "Caravan Phase 2 & Women's Economic Workshops",
    description: "The Caravan continues through Togo and Sierra Leone while women-focused trade and entrepreneurship workshops launch in parallel. Women entrepreneurs gain access to cross-border trade facilitation tools, mentorship circles, and micro-financing information sessions.",
    programme: "women",
    deliverables: ["Women's trade workshops", "Caravan extends to 5 countries", "Mentorship circles launched"],
    highlight: false,
  },
  {
    month: "August 2026",
    country: "🇨🇮 🇬🇭 🇹🇬 🇸🇱 🇳🇬",
    city: "Abidjan, Accra, Lomé, Freetown, Lagos",
    title: "Trade & SME Forums Across West Africa",
    description: "Business-to-business (B2B) forums bring together SME owners, investors, and policymakers in five cities. Pilot trade corridors are demonstrated — showing how simplified customs procedures and digital platforms can accelerate intra-regional commerce. Key sectors: agribusiness, textiles, fintech, and logistics.",
    programme: "trade",
    deliverables: ["B2B matchmaking forums", "Pilot trade corridor demos", "Policy dialogues with regulators"],
    highlight: true,
  },
  {
    month: "September 2026",
    country: "🇨🇻 Cabo Verde",
    city: "Praia",
    title: "West African Cultural & Creative Festival",
    description: "Cabo Verde hosts a week-long celebration of West African cultural diversity — fashion shows, film screenings, literary readings, culinary showcases, music concerts, visual art exhibitions, and sporting events. The festival serves as a creative bridge, highlighting the shared cultural heritage that unites the region.",
    programme: "culture",
    deliverables: ["Cultural festival programme", "Artist residency exchanges", "Documentary filming"],
    highlight: true,
  },
  {
    month: "October 2026",
    country: "Multiple States",
    city: "Regional Broadcast",
    title: "ECOWAS TV Game Show & Awards Shortlist",
    description: "Civic education takes to the airwaves with the ECOWAS TV Game Show — a regional broadcast blending learning with entertainment. Contestants from different Member States answer questions about ECOWAS history, governance, and regional integration. The Parliamentary Awards shortlist is publicly announced, building anticipation for the Grand Finale.",
    programme: "civic",
    deliverables: ["TV Game Show broadcast", "Awards shortlist announced", "Regional viewership campaign"],
    highlight: false,
  },
  {
    month: "November 2026",
    country: "🇳🇬 Nigeria",
    city: "Abuja",
    title: "Grand Finale & Awards Ceremony",
    description: "Leaders, partners, youth champions, entrepreneurs, cultural ambassadors, and citizens gather in Abuja for the closing ceremony of the 25th Anniversary programme. The evening features the inaugural ECOWAS Parliamentary Awards gala, documentary storytelling, reflections on 25 years of democratic governance, and a vision statement for the next quarter-century of the ECOWAS Parliament.",
    programme: "awards",
    deliverables: ["Awards gala ceremony", "Anniversary documentary premiere", "Vision 2050 statement"],
    highlight: true,
  },
];

const filters = [
  { key: "all", label: "All Events" },
  { key: "youth", label: "Youth" },
  { key: "trade", label: "Trade" },
  { key: "women", label: "Women" },
  { key: "civic", label: "Civic" },
  { key: "culture", label: "Culture" },
  { key: "parliament", label: "Parliament" },
  { key: "awards", label: "Awards" },
];

const stats = [
  { value: "11", label: "Months", icon: <Calendar className="h-5 w-5" /> },
  { value: "7+", label: "Countries", icon: <Flag className="h-5 w-5" /> },
  { value: "7", label: "Programme Pillars", icon: <Sparkles className="h-5 w-5" /> },
  { value: "1", label: "Grand Finale", icon: <Trophy className="h-5 w-5" /> },
];

const Timeline = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredEvents = activeFilter === "all"
    ? events
    : events.filter((e) => e.programme === activeFilter);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <svg className="absolute top-8 right-8 w-72 h-72" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              return (
                <line key={i} x1={100 + 40 * Math.cos(angle)} y1={100 + 40 * Math.sin(angle)} x2={100 + 80 * Math.cos(angle)} y2={100 + 80 * Math.sin(angle)} stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
              );
            })}
          </svg>
          <svg className="absolute bottom-10 left-10 w-48 h-48 opacity-60" viewBox="0 0 100 100" fill="none">
            <path d="M10 90 L30 50 L50 70 L70 30 L90 10" stroke="currentColor" strokeWidth="1.5" className="text-accent" strokeLinecap="round" />
            {[{x:10,y:90},{x:30,y:50},{x:50,y:70},{x:70,y:30},{x:90,y:10}].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill="currentColor" className="text-accent" />
            ))}
          </svg>
        </div>

        <div className="container relative">
          <AnimatedSection>
            <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70 mb-4">January — November 2026</Badge>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">Programme<br />Timeline</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              A year-long journey across seven ECOWAS Member States — from strategic planning to the Grand Finale in Abuja.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="flex flex-wrap gap-8 mt-10">
              {stats.map((s) => (
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

      {/* Filter Bar */}
      <section className="py-6 bg-muted/30 border-b border-border sticky top-[65px] z-40 backdrop-blur-sm">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map((f) => (
              <Button
                key={f.key}
                variant={activeFilter === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(f.key)}
                className="whitespace-nowrap flex-shrink-0"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Events */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-8">
              {filteredEvents.map((event, i) => {
                const prog = programmeMap[event.programme];
                return (
                  <AnimatedSection key={`${event.month}-${event.title}`} delay={i * 80}>
                    <div className="relative pl-12 md:pl-16">
                      {/* Dot */}
                      <div className={`absolute left-2.5 md:left-4.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background shadow ${event.highlight ? "bg-accent" : "bg-primary"}`} />

                      <Card className={`border-l-4 ${prog.borderColor} overflow-hidden hover:shadow-lg transition-all duration-300 ${event.highlight ? "ring-1 ring-accent/20" : ""}`}>
                        <CardContent className="p-5">
                          {/* Header */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-sm font-bold text-primary">{event.month}</span>
                            <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{event.country}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{event.city}
                            </span>
                            {event.highlight && (
                              <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">
                                <Star className="h-2.5 w-2.5 mr-0.5" />Milestone
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-bold text-card-foreground text-lg mb-2">{event.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.description}</p>

                          {/* Programme Badge */}
                          <Link to={prog.to} className="inline-block mb-4">
                            <Badge variant="outline" className={`${prog.color} border-0 gap-1 hover:opacity-80 transition-opacity`}>
                              {prog.icon}{prog.label}
                            </Badge>
                          </Link>

                          {/* Deliverables */}
                          <div className="border-t border-border pt-3">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Deliverables</p>
                            <div className="flex flex-wrap gap-2">
                              {event.deliverables.map((d, j) => (
                                <span key={j} className="text-xs bg-muted text-muted-foreground rounded-md px-2 py-1">{d}</span>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>

          {filteredEvents.length === 0 && (
            <AnimatedSection>
              <div className="text-center py-16">
                <p className="text-muted-foreground">No events found for this programme pillar.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveFilter("all")}>Show All Events</Button>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Announcement Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <AnimatedSection className="text-center mb-10">
            <Badge variant="outline" className="mb-3">March 2026</Badge>
            <h2 className="text-2xl font-bold text-foreground">Official Launch Highlights</h2>
            <p className="text-muted-foreground mt-1 max-w-xl mx-auto">
              Moments from the official media announcement launch at Onomo Allure Abuja AATC Hotel.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Press Conference", caption: "Key stakeholders unveil the 25th Anniversary programme to national and international media." },
              { title: "Stakeholder Reception", caption: "Diplomats, programme champions, and ECOWAS officials gather for the launch reception." },
              { title: "Brand Reveal", caption: "The official anniversary brand identity and digital toolkit are presented to the public." },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 120}>
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
                    <div className="p-4 rounded-full bg-background/80 backdrop-blur-sm">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="text-[10px] mb-2">Announcement</Badge>
                    <h3 className="font-semibold text-card-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.caption}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-black text-foreground mb-4">Explore the Programmes</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Dive deeper into each programme pillar to learn about opportunities, events, and how to get involved.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild><Link to="/programmes/youth">Youth Innovation</Link></Button>
              <Button asChild variant="outline"><Link to="/programmes/trade">Trade & SME</Link></Button>
              <Button asChild variant="outline"><Link to="/programmes/awards">Parliamentary Awards</Link></Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Timeline;
