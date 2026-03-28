import { useEffect, useState } from "react";

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
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section className="py-16 bg-gradient-ecowas relative overflow-hidden">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="container relative text-center">
        <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          {timeLeft.past ? "Programme Launched" : "Next Major Event — Media Announcement Launch"}
        </p>
        <p className="text-lg font-bold text-foreground mb-8">
          5th March 2026 · Abuja, Nigeria
        </p>
        <div className="flex justify-center gap-4 md:gap-6">
          {blocks.map((block, i) => (
            <div key={block.label} className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl backdrop-blur-md bg-card/80 border border-border/50 shadow-xl flex items-center justify-center">
                <span className={`text-3xl md:text-4xl font-black text-primary animate-count-in ${block.label === "Seconds" ? "animate-pulse" : ""}`}
                  style={block.label === "Seconds" ? { animationDuration: "2s" } : undefined}>
                  {String(block.value).padStart(2, "0")}
                </span>
              </div>
              <span className="mt-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {block.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-primary animate-pulse-dot"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountdownTimer;
