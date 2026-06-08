import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/AuthContext";
import { FileText, Image, Download, Calendar, Mic, Shield, Mail, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function MediaPortal() {
 const { user } = useAuthContext();
 const navigate = useNavigate();
 const { data: cms } = useSiteContent("media-portal");
 const get = (k: string, fb = "") => (cms?.[k] as string) || fb;

 const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };

 const widgets = [
 { icon: FileText, title: get("press_releases_title", "Press Releases"), desc: get("press_releases_desc", "Early access to official press releases and statements before public distribution."), key: "press" },
 { icon: Image, title: get("photos_title", "High-Res Photo Gallery"), desc: get("photos_desc", "Download high-resolution photographs from all events and programmes."), key: "photos" },
 { icon: Download, title: get("briefings_title", "Briefing Documents"), desc: get("briefings_desc", "Exclusive background briefings, factsheets, and talking points."), key: "briefings" },
 { icon: Mic, title: get("interviews_title", "Interview Requests"), desc: get("interviews_desc", "Schedule interviews with spokespeople and programme leads."), key: "interviews" },
 { icon: Calendar, title: get("calendar_title", "Event Calendar"), desc: get("calendar_desc", "Full event schedule with media access details and press pass management."), key: "calendar", link: "/events", linkLabel: "View Events" },
 { icon: Mail, title: get("liaison_title", "Media Liaison"), desc: get("liaison_desc", "Direct contact with the media team for urgent requests."), key: "liaison", mailto: get("liaison_email", "media@ecowasparliamentinitiatives.org") },
 ];

 return (
 <Layout>
 <section className="bg-gradient-hero text-primary-foreground py-16">
 <div className="container">
 <AnimatedSection>
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div>
 <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">
 <Shield className="h-3 w-3 mr-1" /> Accredited Media
 </Badge>
 <h1 className="text-3xl md:text-4xl font-black">{get("title", "Media Portal")}</h1>
 <p className="mt-2 text-primary-foreground/70">{get("subtitle", `Welcome back, ${user?.email ?? ""}`)}</p>
 </div>
 <Button variant="secondary" size="sm" className="gap-2" onClick={handleSignOut}>
 <LogOut className="h-4 w-4" /> Sign Out
 </Button>
 </div>
 </AnimatedSection>
 </div>
 </section>

 <section className="py-16">
 <div className="container">
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
 {widgets.map((w, i) => {
 const Icon = w.icon;
 return (
 <AnimatedSection key={w.key} delay={i * 80}>
 <Card className={`h-full ${w.key === "liaison" ? "bg-primary/5 border-primary/20" : ""}`}>
 <CardHeader className="pb-3">
 <CardTitle className="text-base flex items-center gap-2">
 <Icon className="h-5 w-5 text-primary" /> {w.title}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground mb-4">{w.desc}</p>
 {w.link && (
 <Button asChild variant="outline" size="sm" className="gap-2"><Link to={w.link}>{w.linkLabel}</Link></Button>
 )}
 {w.mailto && (
 <Button asChild variant="outline" size="sm" className="gap-2">
 <a href={`mailto:${w.mailto}`}><Mail className="h-3 w-3" /> Email Media Team</a>
 </Button>
 )}
 {!w.link && !w.mailto && <Badge variant="secondary" className="text-xs">Coming Soon</Badge>}
 </CardContent>
 </Card>
 </AnimatedSection>
 );
 })}
 </div>
 </div>
 </section>
 </Layout>
 );
}
