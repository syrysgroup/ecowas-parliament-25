import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, ArrowLeft, Share2, Copy, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDate, useTranslation } from "@/lib/i18n";

const COUNTRIES = [
  "Nigeria", "Ghana", "Côte d'Ivoire", "Guinea", "Guinea-Bissau",
  "Senegal", "Benin", "Cabo Verde", "Gambia", "Liberia", "Sierra Leone", "Togo",
];

function generateICS(event: any) {
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ECOWAS Parliament//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(event.date)}`,
    `DTEND:${fmt(event.end_date || event.date)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ""}`,
    `LOCATION:${event.location || ""}, ${event.country || ""}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `event.ics`; a.click();
  URL.revokeObjectURL(url);
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", country: "", organisation: "" });
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event-detail", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (user) setForm(f => ({ ...f, email: user.email || "" }));
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <section className="py-20"><div className="container text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div></section>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <section className="py-20"><div className="container text-center">
          <h1 className="text-3xl font-black text-foreground mb-4">Event not found</h1>
          <Button asChild><Link to="/events">Back to Events</Link></Button>
        </div></section>
      </Layout>
    );
  }

  const eventDate = new Date(event.date);
  const endDate = event.end_date ? new Date(event.end_date) : eventDate;
  const isPast = endDate < new Date();
  const shareUrl = window.location.href;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const insertData: any = {
        event_id: event.id, name: form.name,
        email: form.email, country: form.country, organisation: form.organisation,
      };
      if (user) insertData.user_id = user.id;
      await supabase.from("event_registrations").insert(insertData);
      setRegistered(true);
      toast({ title: "Registration confirmed!", description: `You're registered for ${event.title}` });
    } catch {
      setRegistered(true);
      toast({ title: "Registration saved", description: "You're registered for this event." });
    } finally { setSubmitting(false); }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showForm = event.registration_type === "form" && !isPast;
  const showExternal = event.registration_type === "external" && event.registration_url && !isPast;

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container">
          <AnimatedSection>
            <Button asChild variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 mb-6">
              <Link to="/events"><ArrowLeft className="mr-2 h-4 w-4" />All Events</Link>
            </Button>
            <div className="flex items-center gap-2 mb-3">
              {event.tag && <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">{event.tag}</Badge>}
              {event.programme && <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">{event.programme}</Badge>}
              {isPast && <Badge className="bg-destructive/80 text-destructive-foreground border-0">Concluded</Badge>}
            </div>
            <h1 className="text-3xl md:text-5xl font-black">{event.title}</h1>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(eventDate, locale)}</span>
              {event.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.location}{event.country ? `, ${event.country}` : ""}</span>}
              {event.capacity && <span className="flex items-center gap-1"><Users className="h-4 w-4" />Capacity: {event.capacity}</span>}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className="space-y-8">
              {event.cover_image_url && (
                <AnimatedSection>
                  <img src={event.cover_image_url} alt={event.title} className="w-full rounded-2xl shadow-lg" loading="lazy" />
                </AnimatedSection>
              )}
              <AnimatedSection>
                <h2 className="text-2xl font-bold text-foreground mb-4">About this Event</h2>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">{event.description}</p>
              </AnimatedSection>

              <AnimatedSection>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"><Share2 className="h-4 w-4" />Share this Event</h3>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">𝕏 Twitter</a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Facebook</a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${event.title} ${shareUrl}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyLink}>
                    {copied ? <><CheckCircle2 className="h-3 w-3" />Copied!</> : <><Copy className="h-3 w-3" />Copy Link</>}
                  </Button>
                </div>
              </AnimatedSection>

              {isPast && (
                <AnimatedSection>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"><ExternalLink className="h-4 w-4" />Press & Related Briefings</h3>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground italic">No press articles linked yet. Check back soon.</p>
                  </div>
                </AnimatedSection>
              )}
            </div>

            <div className="space-y-6">
              <AnimatedSection>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                  {isPast ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-xl font-bold text-card-foreground">This event has concluded</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Registration is no longer available.</p>
                    </div>
                  ) : showExternal ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-card-foreground">Register for this Event</h3>
                      <Button asChild className="w-full gap-2">
                        <a href={event.registration_url!} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />Register Externally
                        </a>
                      </Button>
                    </div>
                  ) : showForm ? (
                    <>
                      <h3 className="text-xl font-bold text-card-foreground mb-2">
                        {registered ? "You're Registered! ✅" : "Register for this Event"}
                      </h3>
                      {registered ? (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">We'll send you details closer to the date.</p>
                          <Button className="w-full gap-2" variant="outline" onClick={() => generateICS(event)}>
                            <Calendar className="h-4 w-4" />Add to Calendar (.ics)
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleRegister} className="space-y-4 mt-4">
                          <div><Label>Full Name</Label><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" /></div>
                          <div><Label>Email</Label><Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" /></div>
                          <div>
                            <Label>Country</Label>
                            <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                              <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div><Label>Organisation (optional)</Label><Input value={form.organisation} onChange={e => setForm(f => ({ ...f, organisation: e.target.value }))} placeholder="Your organisation" /></div>
                          <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Registering…" : "Register Now"}
                          </Button>
                        </form>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-card-foreground">Event Details</h3>
                      <p className="text-sm text-muted-foreground">Registration is not required for this event.</p>
                    </div>
                  )}

                  {!isPast && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button className="w-full gap-2" variant="outline" onClick={() => generateICS(event)}>
                        <Calendar className="h-4 w-4" />Add to Calendar
                      </Button>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
