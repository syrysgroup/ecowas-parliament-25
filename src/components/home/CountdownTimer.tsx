import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";

const UPCOMING_EVENT = {
  name: "ECOWAS Parliament 25th Anniversary Ceremony — Abuja, Nigeria",
  date: new Date("2026-04-15T09:00:00+01:00"),
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = UPCOMING_EVENT.date.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      past: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const blocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="relative overflow-hidden border-y border-white/10 py-5 px-6 md:px-11" style={{
      background: "linear-gradient(135deg, hsl(152 80% 14%) 0%, hsl(152 60% 10%) 40%, hsl(200 40% 8%) 100%)",
    }}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative max-w-screen-xl mx-auto flex items-center justify-between gap-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10">
            <CalendarClock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent mb-0.5">
              {timeLeft.past ? "Event Started" : "Event Countdown"}
            </p>
            <p className="text-sm md:text-base font-bold text-white">
              {UPCOMING_EVENT.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {blocks.map((block) => (
            <div key={block.label} className="text-center rounded-lg px-3 py-2 min-w-[56px] md:min-w-[64px]" style={{
              background: "linear-gradient(180deg, hsl(152 60% 18% / 0.6) 0%, hsl(152 40% 10% / 0.8) 100%)",
              border: "1px solid hsl(152 60% 30% / 0.25)",
              boxShadow: "inset 0 1px 0 hsl(152 60% 40% / 0.1), 0 2px 8px hsl(0 0% 0% / 0.3)",
            }}>
              <span className="text-2xl md:text-3xl font-black text-white leading-none block">
                {String(block.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/50 font-semibold">
                {block.label}
              </span>
            </div>
          ))}
        </div>

        <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs shadow-lg">
          <Link to="/events">View Details →</Link>
        </Button>
      </div>
    </div>
  );
};

export default CountdownTimer;
