import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface TimeLeft {
 days: number;
 hours: number;
 minutes: number;
 seconds: number;
 past: boolean;
}

interface CountdownEvent {
 id: string;
 title: string;
 date: string;
 end_date: string | null;
 location: string | null;
 country: string | null;
}

function computeTimeLeft(targetDate: Date): TimeLeft {
 const diff = targetDate.getTime() - Date.now();
 if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
 return {
 days: Math.floor(diff / (1000 * 60 * 60 * 24)),
 hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
 minutes: Math.floor((diff / (1000 * 60)) % 60),
 seconds: Math.floor((diff / 1000) % 60),
 past: false,
 };
}

function getStartOfToday(): Date {
 const d = new Date();
 d.setHours(0, 0, 0, 0);
 return d;
}

function resolveActive(events: CountdownEvent[]): {
 active: CountdownEvent | null;
 next: CountdownEvent | null;
 isOngoing: boolean;
} {
 const nowMs = Date.now();
 const startOfToday = getStartOfToday().getTime();

 let activeIdx = -1;
 let isOngoing = false;

 for (let i = 0; i < events.length; i++) {
 const e = events[i];
 const start = new Date(e.date).getTime();
 const end = e.end_date ? new Date(e.end_date).getTime() : null;
 const ongoing = start <= nowMs && (end != null ? end >= nowMs : start >= startOfToday);

 if (ongoing) {
 activeIdx = i;
 isOngoing = true;
 break;
 }
 if (start > nowMs && activeIdx === -1) {
 activeIdx = i;
 }
 }

 const active = activeIdx !== -1 ? events[activeIdx] : (events[0] ?? null);
 const nextIdx = active ? events.findIndex(e => e !== active && new Date(e.date).getTime() > nowMs) : -1;
 const next = nextIdx !== -1 ? events[nextIdx] : null;

 return { active, next, isOngoing };
}

// Fallback values if no published future events exist
const FALLBACK_DATE = new Date("2026-04-15T09:00:00+01:00");
const FALLBACK_NAME = "ECOWAS Parliament Initiatives 25th Anniversary Ceremony, Abuja, Nigeria";

const CountdownTimer = () => {
 const { t } = useTranslation();

 const startOfToday = getStartOfToday();

 const { data: events = [] } = useQuery<CountdownEvent[]>({
 queryKey: ["countdown-events"],
 queryFn: async () => {
 const now = new Date().toISOString();
 const todayIso = startOfToday.toISOString();
 const { data } = await supabase
 .from("events")
 .select("id, title, date, end_date, location, country")
 .eq("is_published", true)
 .or(`date.gte.${todayIso},end_date.gte.${now}`)
 .order("date", { ascending: true })
 .limit(5);
 return (data ?? []) as CountdownEvent[];
 },
 staleTime: 5 * 60 * 1000,
 refetchInterval: 60_000,
 });

 const { active: activeEvent, next: nextEvent, isOngoing } = useMemo(
 () => resolveActive(events),
 [events],
 );

 const hasLiveEvents = events.length > 0;
 const eventDate = hasLiveEvents && activeEvent ? new Date(activeEvent.date) : FALLBACK_DATE;
 const eventName = hasLiveEvents && activeEvent ? activeEvent.title : FALLBACK_NAME;
 const detailLink = hasLiveEvents && activeEvent ? `/events/${activeEvent.id}` : "/events";

 const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(eventDate));

 useEffect(() => {
 if (isOngoing) return;
 const recalc = () => setTimeLeft(computeTimeLeft(eventDate));
 recalc();
 const timer = setInterval(recalc, 1000);
 return () => clearInterval(timer);
 }, [eventDate.getTime(), isOngoing]);

 const blocks = [
 { label: t("countdown.days"), value: timeLeft.days },
 { label: t("countdown.hours"), value: timeLeft.hours },
 { label: t("countdown.mins"), value: timeLeft.minutes },
 { label: t("countdown.secs"), value: timeLeft.seconds },
 ];

 return (
 <div
 className="relative overflow-hidden border-y border-white/10 py-5 px-6 md:px-11"
 style={{
 background:
 "linear-gradient(135deg, hsl(152 80% 14%) 0%, hsl(152 60% 10%) 40%, hsl(200 40% 8%) 100%)",
 }}
 >
 <div
 className="absolute inset-0 opacity-[0.04]"
 style={{
 backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
 backgroundSize: "24px 24px",
 }}
 />
 <div className="relative max-w-screen-xl mx-auto flex flex-col gap-1">
 <div className="flex items-center justify-between gap-5 flex-wrap">
 {/* Event label */}
 <div className="flex items-center gap-3">
 <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10">
 <CalendarClock className="w-5 h-5 text-accent" />
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent mb-0.5">
 {isOngoing ? t("countdown.ongoingEvent") : t("countdown.eventCountdown")}
 </p>
 <p className="text-sm md:text-base font-bold text-white">{eventName}</p>
 </div>
 </div>

 {/* Countdown blocks or Ongoing badge */}
 {isOngoing ? (
 <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
 <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
 <span className="text-white font-bold text-sm">{t("countdown.ongoingEvent")}</span>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 {blocks.map((block) => (
 <div
 key={block.label}
 className="text-center rounded-lg px-3 py-2 min-w-[56px] md:min-w-[64px]"
 style={{
 background:
 "linear-gradient(180deg, hsl(152 60% 18% / 0.6) 0%, hsl(152 40% 10% / 0.8) 100%)",
 border: "1px solid hsl(152 60% 30% / 0.25)",
 boxShadow:
 "inset 0 1px 0 hsl(152 60% 40% / 0.1), 0 2px 8px hsl(0 0% 0% / 0.3)",
 }}
 >
 <span className="text-2xl md:text-3xl font-black text-white leading-none block">
 {String(block.value).padStart(2, "0")}
 </span>
 <span className="text-[9px] uppercase tracking-wider text-white/50 font-semibold">
 {block.label}
 </span>
 </div>
 ))}
 </div>
 )}

 <Button
 asChild
 size="sm"
 className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs shadow-lg"
 >
 <Link to={detailLink}>{t("countdown.viewDetails")}</Link>
 </Button>
 </div>

 {/* Up next strip */}
 {nextEvent && (
 <p className="text-[10px] text-white/40 pl-[52px]">
 {t("countdown.upNext")} · {nextEvent.title}
 </p>
 )}
 </div>
 </div>
 );
};

export default CountdownTimer;
