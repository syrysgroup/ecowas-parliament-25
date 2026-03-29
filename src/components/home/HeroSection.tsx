import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import anniversary25Logo from "@/assets/parliament-25-anniversary-logo.png";
import parliamentBg from "@/assets/parliament-chamber.png";

const stats = [
  { label: "Member States", target: 12 },
  { label: "Programmes", target: 7 },
  { label: "Years", target: 25 },
  { label: "Delegates", target: 1200, suffix: "+" },
];

const CountUpNumber = ({ target, suffix, delay = 0 }: { target: number; suffix?: string; delay?: number }) => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) { setCount(target); clearInterval(interval); }
        else setCount(Math.floor(current));
      }, duration / steps);
    }, delay);
    return () => clearTimeout(timer);
  }, [isVisible, target, delay]);

  return <span ref={ref as React.RefObject<HTMLSpanElement>}>{count.toLocaleString()}{suffix}</span>;
};

const Particle = ({ size, x, y, delay, color }: { size: number; x: string; y: string; delay: string; color: string }) => (
  <div
    className="absolute rounded-full animate-particle pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, animationDelay: delay, background: color, opacity: 0.35 }}
  />
);

const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-gradient-hero text-primary-foreground">
      {/* Background image */}
      <img src={parliamentBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none" />
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 animate-gradient-shift opacity-30" style={{
        background: "linear-gradient(135deg, hsl(152 100% 26% / 0.4), hsl(50 87% 45% / 0.15), hsl(340 66% 34% / 0.1), hsl(152 100% 20% / 0.3))",
        backgroundSize: "400% 400%",
      }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 60px,hsl(152 100% 26% / 0.5) 60px,hsl(152 100% 26% / 0.5) 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,hsl(152 100% 26% / 0.5) 60px,hsl(152 100% 26% / 0.5) 61px)",
      }} />

      {/* Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[150px] -left-[150px] w-[600px] h-[600px] rounded-full blur-[100px] animate-float" style={{ background: "radial-gradient(circle,hsl(152 100% 26% / 0.18),transparent 70%)" }} />
        <div className="absolute -bottom-[100px] -right-[80px] w-[450px] h-[450px] rounded-full blur-[100px] animate-float" style={{ animationDirection: "reverse", animationDuration: "11s", background: "radial-gradient(circle,hsl(340 66% 34% / 0.1),transparent 70%)" }} />
        <div className="absolute top-[45%] left-[58%] w-[260px] h-[260px] rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s", animationDuration: "7s", background: "radial-gradient(circle,hsl(50 87% 45% / 0.07),transparent 70%)" }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Particle size={6} x="8%" y="15%" delay="0s" color="hsl(50 87% 45%)" />
        <Particle size={4} x="25%" y="70%" delay="1.2s" color="hsl(152 100% 40%)" />
        <Particle size={8} x="75%" y="20%" delay="0.5s" color="hsl(50 87% 45%)" />
        <Particle size={5} x="90%" y="60%" delay="2s" color="hsl(73 53% 49%)" />
        <Particle size={3} x="60%" y="80%" delay="0.8s" color="hsl(152 100% 30%)" />
      </div>

      {/* Content — centered */}
      <div className="relative z-10 text-center max-w-4xl px-6 md:px-10 py-20 md:py-28">
        {/* Dual logo row */}
        <div className="flex items-center justify-center mb-11 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col items-center gap-2.5">
            <div className="bg-white rounded-full p-2 shadow-lg"><img src={ecowasLogo} alt="ECOWAS Parliament" className="h-16 w-16 md:h-20 md:w-20 object-contain animate-float" /></div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">ECOWAS Parliament</p>
              <p className="text-[10px] uppercase tracking-widest text-white/50">Parlement de la CEDEAO</p>
            </div>
          </div>
        </div>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-5 py-1.5 text-[11.5px] font-semibold uppercase tracking-widest text-primary bg-primary/10 backdrop-blur-sm mb-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          Celebrating 25 years of representation
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.06] text-primary-foreground mb-5 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          Celebrating <span className="text-accent">25 Years</span>
          <span className="block text-lg md:text-2xl lg:text-3xl font-bold text-primary-foreground/70 mt-3">
            of West African Parliamentary Representation
          </span>
        </h1>

        {/* Description */}
        <p className="text-base text-primary-foreground/60 max-w-xl mx-auto leading-relaxed mb-9 animate-slide-up" style={{ animationDelay: "0.7s" }}>
          The ECOWAS Parliament unites the 12 member states of the Economic Community of West
          African States — advancing regional representation, integration, and shared
          prosperity for all West Africans.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center flex-wrap gap-3 mb-14 animate-slide-up" style={{ animationDelay: "0.9s" }}>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg">
            <Link to="/about">
              Explore the Programme
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10 backdrop-blur-sm">
            <Link to="/contact">Register Interest →</Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex justify-center flex-wrap gap-0 bg-primary-foreground/[0.03] border border-primary-foreground/10 rounded-2xl px-7 py-5 animate-slide-up" style={{ animationDelay: "1.1s" }}>
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center px-7 relative">
              {i < stats.length - 1 && (
                <div className="absolute right-0 top-[15%] h-[70%] w-px bg-primary-foreground/10 hidden sm:block" />
              )}
              <p className="text-3xl md:text-4xl font-black text-primary leading-none mb-1">
                <CountUpNumber target={stat.target} suffix={stat.suffix} delay={i * 200} />
              </p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-primary-foreground/40">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-fade-in z-10" style={{ animationDelay: "2s" }}>
        <span className="text-[9px] uppercase tracking-[0.18em] text-primary-foreground/30">Scroll</span>
        <span className="w-px h-8 bg-gradient-to-b from-primary to-transparent animate-pulse" style={{ animationDuration: "1.8s" }} />
      </div>
    </section>
  );
};

export default HeroSection;
