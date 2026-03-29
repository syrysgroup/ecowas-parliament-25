import { useEffect, useRef, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const stats = [
  { target: 12, label: "Member States" },
  { target: 25, label: "Years of Democracy" },
  { target: 7, label: "Programmes" },
  { target: 1200, label: "Expected Delegates", suffix: "+" },
  { target: 3, label: "Award Categories" },
];

const CountUp = ({ target, suffix, delay = 0 }: { target: number; suffix?: string; delay?: number }) => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1500;
    const steps = 40;
    const inc = target / steps;
    let cur = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        cur += inc;
        if (cur >= target) { setCount(target); clearInterval(iv); }
        else setCount(Math.floor(cur));
      }, duration / steps);
    }, delay);
    return () => clearTimeout(t);
  }, [isVisible, target, delay]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {count.toLocaleString()}{suffix && <span className="text-[0.5em] align-super text-primary">{suffix}</span>}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-ecowas border-t border-b border-primary/20 text-center">
      <div className="container">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary-foreground/60 mb-3">
          25 Years of Impact
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 max-w-4xl mx-auto">
          {stats.map((s, i) => (
            <div key={s.label}>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black text-accent leading-none mb-2">
                <CountUp target={s.target} suffix={s.suffix} delay={i * 150} />
              </p>
              <p className="text-xs md:text-sm text-primary-foreground/70 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
