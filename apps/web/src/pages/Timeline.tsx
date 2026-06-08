import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
 Calendar, MapPin, Flag, Trophy, Lightbulb, TrendingUp,
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

interface DBEvent {
 id: string;
 month_label: string;
 sort_order: number;
 country: string;
 city: string;
 title: string;
 description: string;
 programme: string;
 deliverables: string[];
 highlight: boolean;
}

function safeParse<T>(input: any, fallback: T): T {
 try {
 if (input == null || input === "") return fallback;
 if (typeof input !== "string") return input as T;
 return JSON.parse(input) as T;
 } catch { return fallback; }
}

const Timeline = () => {
 const [activeFilter, setActiveFilter] = useState("all");

 const { data: events = [] } = useQuery<DBEvent[]>({
 queryKey: ["public-timeline-events"],
 queryFn: async () => {
 const { data } = await supabase
 .from("timeline_events" as any)
 .select("id, month_label, sort_order, country, city, title, description, programme, deliverables, highlight")
 .eq("is_published", true)
 .order("sort_order", { ascending: true });
 return (data ?? []) as any;
 },
 });

 const { data: hero } = useSiteContent("timeline_hero");
 const { data: highlights } = useSiteContent("timeline_launch_highlights");
 const { data: cta } = useSiteContent("timeline_cta");

 const filters = useMemo(() => {
 const set = new Set(events.map(e => e.programme));
 return [
 { key: "all", label: "All Events" },
 ...Array.from(set).map(k => ({ key: k, label: programmeMap[k]?.label ?? k })),
 ];
 }, [events]);

 const filteredEvents = activeFilter === "all" ? events : events.filter(e => e.programme === activeFilter);

 const heroBadge = hero?.badge || "January, November 2026";
 const heroTitle = hero?.title || "Programme|Timeline";
 const heroDescription = hero?.description || "A year-long journey across seven ECOWAS Member States, from strategic planning to the Grand Finale in Abuja.";

 const stats = [
 { value: hero?.stat1_value || String(events.length), label: hero?.stat1_label || "Events", icon: <Calendar className="h-5 w-5" /> },
 { value: hero?.stat2_value || "7+", label: hero?.stat2_label || "Countries", icon: <Flag className="h-5 w-5" /> },
 { value: hero?.stat3_value || "7", label: hero?.stat3_label || "Programme Pillars", icon: <Sparkles className="h-5 w-5" /> },
 { value: hero?.stat4_value || "1", label: hero?.stat4_label || "Grand Finale", icon: <Trophy className="h-5 w-5" /> },
 ];

 const highlightItems = safeParse<Array<{ title: string; caption: string; image_url?: string }>>(
 highlights?.items as any,
 [
 { title: "Press Conference", caption: "Key stakeholders unveil the 25th Anniversary programme to national and international media." },
 { title: "Stakeholder Reception", caption: "Diplomats, programme champions, and ECOWAS officials gather for the launch reception." },
 { title: "Brand Reveal", caption: "The official anniversary brand identity and digital toolkit are presented to the public." },
 ]
 );

 const ctaButtons = safeParse<Array<{ label: string; href: string; variant?: "default" | "outline" }>>(
 cta?.buttons as any,
 [
 { label: "Youth Innovation", href: "/programmes/youth", variant: "default" },
 { label: "Trade & SME", href: "/programmes/trade", variant: "outline" },
 { label: "Parliamentary Awards", href: "/programmes/awards", variant: "outline" },
 ]
 );

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
 </div>

 <div className="container relative">
 <AnimatedSection>
 <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70 mb-4">{heroBadge}</Badge>
 <h1 className="text-4xl md:text-6xl font-black leading-tight">
 {heroTitle.split("|").map((line, i) => (
 <span key={i}>{line}{i < heroTitle.split("|").length - 1 && <br />}</span>
 ))}
 </h1>
 <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{heroDescription}</p>
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
 <Button key={f.key} variant={activeFilter === f.key ? "default" : "outline"} size="sm"
 onClick={() => setActiveFilter(f.key)} className="whitespace-nowrap flex-shrink-0">
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
 <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />
 <div className="space-y-8">
 {filteredEvents.map((event, i) => {
 const prog = programmeMap[event.programme] ?? programmeMap.general;
 return (
 <AnimatedSection key={event.id} delay={i * 80}>
 <div className="relative pl-12 md:pl-16">
 <div className={`absolute left-2.5 md:left-4.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background shadow ${event.highlight ? "bg-accent" : "bg-primary"}`} />
 <Card className={`border-l-4 ${prog.borderColor} overflow-hidden hover:shadow-lg transition-all duration-300 ${event.highlight ? "ring-1 ring-accent/20" : ""}`}>
 <CardContent className="p-5">
 <div className="flex flex-wrap items-center gap-2 mb-3">
 <span className="text-sm font-bold text-primary">{event.month_label}</span>
 {event.country && <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{event.country}</span>}
 {event.city && (
 <span className="text-xs text-muted-foreground flex items-center gap-1">
 <MapPin className="h-3 w-3" />{event.city}
 </span>
 )}
 {event.highlight && (
 <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">
 <Star className="h-2.5 w-2.5 mr-0.5" />Milestone
 </Badge>
 )}
 </div>
 <h3 className="font-bold text-card-foreground text-lg mb-2">{event.title}</h3>
 {event.description && <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.description}</p>}
 <Link to={prog.to} className="inline-block mb-4">
 <Badge variant="outline" className={`${prog.color} border-0 gap-1 hover:opacity-80 transition-opacity`}>
 {prog.icon}{prog.label}
 </Badge>
 </Link>
 {event.deliverables?.length > 0 && (
 <div className="border-t border-border pt-3">
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Deliverables</p>
 <div className="flex flex-wrap gap-2">
 {event.deliverables.map((d, j) => (
 <span key={j} className="text-xs bg-muted text-muted-foreground rounded-md px-2 py-1">{d}</span>
 ))}
 </div>
 </div>
 )}
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

 {/* Launch Highlights Gallery */}
 {highlightItems.length > 0 && (
 <section className="py-16 bg-muted/30">
 <div className="container">
 <AnimatedSection className="text-center mb-10">
 <Badge variant="outline" className="mb-3">{highlights?.badge || "March 2026"}</Badge>
 <h2 className="text-2xl font-bold text-foreground">{highlights?.title || "Official Launch Highlights"}</h2>
 <p className="text-muted-foreground mt-1 max-w-xl mx-auto">
 {highlights?.subtitle || "Moments from the official media announcement launch at Onomo Allure Abuja AATC Hotel."}
 </p>
 </AnimatedSection>

 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {highlightItems.map((item, i) => (
 <AnimatedSection key={i} delay={i * 120}>
 <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
 {item.image_url ? (
 <div className="aspect-video overflow-hidden">
 <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
 </div>
 ) : (
 <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
 <div className="p-4 rounded-full bg-background/80 backdrop-blur-sm">
 <Calendar className="h-8 w-8 text-primary" />
 </div>
 </div>
 )}
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
 )}

 {/* CTA */}
 <section className="py-20">
 <div className="container text-center">
 <AnimatedSection>
 <h2 className="text-3xl font-black text-foreground mb-4">{cta?.title || "Explore the Programmes"}</h2>
 <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
 {cta?.description || "Dive deeper into each programme pillar to learn about opportunities, events, and how to get involved."}
 </p>
 <div className="flex flex-wrap justify-center gap-3">
 {ctaButtons.map((b, i) => (
 <Button key={i} asChild variant={b.variant ?? (i === 0 ? "default" : "outline")}>
 <Link to={b.href}>{b.label}</Link>
 </Button>
 ))}
 </div>
 </AnimatedSection>
 </div>
 </section>
 </Layout>
 );
};

export default Timeline;
