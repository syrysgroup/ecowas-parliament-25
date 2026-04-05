import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

const TAG_COLORS: Record<string, string> = {
  primary: "border-primary/40 text-primary bg-primary/5",
  blue: "border-blue-500/40 text-blue-500 bg-blue-500/5",
  amber: "border-amber-500/40 text-amber-500 bg-amber-500/5",
  red: "border-red-500/40 text-red-500 bg-red-500/5",
  violet: "border-violet-500/40 text-violet-500 bg-violet-500/5",
};

const EventsSection = () => {
  const { t } = useTranslation();

  const { data: events = [] } = useQuery({
    queryKey: ["homepage-events"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("events")
        .select("id, title, date, location, tag, tag_color, registration_type, registration_url, is_published")
        .eq("is_published", true)
        .order("date", { ascending: true })
        .limit(5);
      return data ?? [];
    },
  });

  // Fallback hardcoded events if none in DB
  const fallbackEvents = [
    { day: "31", month: "Mar", title: t("eventsSection.ev1.title"), tag: "Finance", tagColor: "border-accent/40 text-accent bg-accent/5", location: "Internal", cta: "Details →" },
    { day: "1", month: "Apr", title: t("eventsSection.ev2.title"), tag: "Sponsors", tagColor: "border-primary/40 text-primary bg-primary/5", location: "Abuja, Nigeria", cta: "RSVP →" },
    { day: "4", month: "Apr", title: t("eventsSection.ev3.title"), tag: "Women's Forum", tagColor: "border-secondary/40 text-secondary bg-secondary/5", location: "Dakar, Senegal", cta: "Register →" },
    { day: "18", month: "Apr", title: t("eventsSection.ev4.title"), tag: "Trade & SME", tagColor: "border-primary/40 text-primary bg-primary/5", location: "Abuja, Nigeria", cta: "Register →" },
    { day: "10", month: "May", title: t("eventsSection.ev5.title"), tag: "Youth Parliament", tagColor: "border-ecowas-lime/40 text-ecowas-lime bg-ecowas-lime/5", location: "All 12 States", cta: "Apply →" },
  ];

  const displayEvents = events.length > 0
    ? events.map((ev: any) => {
        const dateObj = parseISO(ev.date);
        const cta = ev.registration_type === "external" ? "Register →"
          : ev.registration_type === "form" ? "Register →" : "Details →";
        return {
          day: format(dateObj, "d"),
          month: format(dateObj, "MMM"),
          title: ev.title,
          tag: ev.tag || "",
          tagColor: TAG_COLORS[ev.tag_color] ?? TAG_COLORS.primary,
          location: ev.location || "",
          cta,
        };
      })
    : fallbackEvents;

  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">{t("eventsSection.badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">{t("eventsSection.title")}</h2>
          </AnimatedSection>
          <Link to="/events" className="text-sm text-primary font-bold hover:gap-2.5 inline-flex items-center gap-1.5 transition-all">
            {t("eventsSection.fullCalendar")}
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {displayEvents.map((ev, i) => (
            <AnimatedSection key={`${ev.title}-${i}`} delay={i * 80}>
              <div className="flex items-center gap-4 md:gap-5 bg-card border border-border rounded-xl px-5 py-4 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group">
                <div className="text-center min-w-[48px] shrink-0">
                  <p className="text-2xl font-black text-accent leading-none">{ev.day}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{ev.month}</p>
                </div>
                <div className="w-px h-8 bg-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-card-foreground mb-1 truncate">{ev.title}</p>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {ev.tag && <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ev.tagColor}`}>{ev.tag}</span>}
                    {ev.location && <span className="text-[11px] text-muted-foreground">📍 {ev.location}</span>}
                  </div>
                </div>
                <span className="text-xs text-primary font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{ev.cta}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
