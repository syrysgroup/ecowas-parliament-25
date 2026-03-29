import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TARGET_DATE = new Date("2026-03-05T12:00:00+01:00");

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = TARGET_DATE.getTime() - now.getTime();
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
    <div className="bg-gradient-to-r from-[hsl(20_60%_6%)] to-card border-t border-secondary/25 border-b border-b-border py-5 px-6 md:px-11">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-5 flex-wrap">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary mb-1">
            {timeLeft.past ? "Programme Launched" : "Next Major Event"}
          </p>
          <p className="text-base md:text-lg font-black text-foreground">
            ECOWAS Parliament 25th Anniversary Ceremony — Abuja, Nigeria
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {blocks.map((block) => (
            <div key={block.label} className="text-center bg-background/30 border border-border rounded-lg px-3 py-2 min-w-[60px] md:min-w-[66px]">
              <span className="text-2xl md:text-3xl font-black text-accent leading-none block">
                {String(block.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                {block.label}
              </span>
            </div>
          ))}
        </div>

        <Button asChild size="sm" className="font-bold text-xs">
          <Link to="/events">View Details →</Link>
        </Button>
      </div>
    </div>
  );
};

export default CountdownTimer;
