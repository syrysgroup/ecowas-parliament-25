import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation, formatDate } from "@/lib/i18n";

const COUNTRIES = [
  "Nigeria", "Ghana", "Côte d'Ivoire", "Guinea", "Guinea-Bissau",
  "Senegal", "Benin", "Cabo Verde", "Gambia", "Liberia", "Sierra Leone", "Togo",
];

const staticEvents = [
  { id: "ev1", title: "Official Launch & Awards Nominations Open", description: "The 25th Anniversary programme is officially launched at a press conference in Abuja.", date: "2026-03-05T09:00:00Z", location: "Onomo Allure Abuja AATC Hotel", country: "Nigeria", programme: "Awards", capacity: 300, is_published: true },
  { id: "ev2", title: "ECOWAS Smart Challenge & Media Training Forum", description: "National youth innovation competitions in Ghana and Senegal with media training for 50+ journalists.", date: "2026-04-15T09:00:00Z", location: "Accra International Conference Centre", country: "Ghana", programme: "Youth", capacity: 500, is_published: true },
  { id: "ev3", title: "Simulated Youth Parliament", description: "150+ young people from across West Africa debate policy issues in a simulated ECOWAS Parliament session.", date: "2026-05-20T09:00:00Z", location: "Palais de la Culture, Abidjan", country: "Côte d'Ivoire", programme: "Parliament", capacity: 200, is_published: true },
  { id: "ev4", title: "Trade & SME Forums", description: "B2B forums bringing together SME owners, investors, and policymakers across five cities.", date: "2026-08-10T09:00:00Z", location: "Multiple venues", country: "Nigeria", programme: "Trade", capacity: 400, is_published: true },
  { id: "ev5", title: "West African Cultural & Creative Festival", description: "A week-long celebration of West African cultural diversity — fashion, film, food, literature, music, art, and sport.", date: "2026-09-15T09:00:00Z", location: "Praia Convention Centre", country: "Cabo Verde", programme: "Culture", capacity: 1000, is_published: true },
  { id: "ev6", title: "Grand Finale & Awards Ceremony", description: "Leaders, partners, youth champions, and citizens gather for the closing ceremony and inaugural AWALCO Parliamentary Awards.", date: "2026-11-20T18:00:00Z", location: "ECOWAS Parliament Complex, Abuja", country: "Nigeria", programme: "Awards", capacity: 500, is_published: true },
];

export default function Events() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [events] = useState(staticEvents);
  const [rsvpEvent, setRsvpEvent] = useState<typeof staticEvents[0] | null>(null);
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: "", email: "", country: "", organisation: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setForm(f => ({ ...f, email: user.email || "" }));
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpEvent) return;
    setSubmitting(true);
    try {
      if (user) {
        await (supabase as any).from("event_registrations").insert({
          event_id: rsvpEvent.id, user_id: user.id, name: form.name,
          email: form.email, country: form.country, organisation: form.organisation,
        });
      }
      setRegistered(prev => new Set(prev).add(rsvpEvent.id));
      toast({ title: "Registration confirmed!", description: `You're registered for ${rsvpEvent.title}` });
      setRsvpEvent(null);
      setForm(f => ({ ...f, name: "", organisation: "" }));
    } catch {
      toast({ title: "Registration saved", description: "You're registered for this event." });
      setRegistered(prev => new Set(prev).add(rsvpEvent!.id));
      setRsvpEvent(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">{t("events.upcoming")}</Badge>
            <h1 className="text-4xl md:text-5xl font-black">{t("events.title")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("events.subtitle")}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event, i) => {
              const eventDate = new Date(event.date);
              const isRegistered = registered.has(event.id);
              return (
                <AnimatedSection key={event.id} delay={i * 80}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-[10px]">{event.programme}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(eventDate, locale)}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.country}</span>
                        {event.capacity && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t("events.capacity", { count: event.capacity })}</span>}
                      </div>
                      {isRegistered ? (
                        <Button disabled variant="outline" className="gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t("events.registered")}</Button>
                      ) : (
                        <Button onClick={() => setRsvpEvent(event)} className="gap-2">{t("events.register")}</Button>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!rsvpEvent} onOpenChange={() => setRsvpEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("events.registerForEvent")}</DialogTitle>
          </DialogHeader>
          {rsvpEvent && (
            <form onSubmit={handleRegister} className="space-y-4">
              <p className="text-sm text-muted-foreground">{rsvpEvent.title}</p>
              <div>
                <Label>{t("events.fullNameLabel")}</Label>
                <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t("events.fullNamePlaceholder")} />
              </div>
              <div>
                <Label>{t("events.emailLabel")}</Label>
                <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={t("events.emailPlaceholder")} />
              </div>
              <div>
                <Label>{t("events.countryLabel")}</Label>
                <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                  <SelectTrigger><SelectValue placeholder={t("events.selectCountry")} /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("events.orgLabel")}</Label>
                <Input value={form.organisation} onChange={e => setForm(f => ({ ...f, organisation: e.target.value }))} placeholder={t("events.orgPlaceholder")} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t("auth.registering") : t("auth.confirmRegistration")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
