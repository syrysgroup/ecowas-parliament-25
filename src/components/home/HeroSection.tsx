import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import SocialMediaBar from "@/components/shared/SocialMediaBar";
import anniversary25Logo from "@/assets/parliament-25-logo.png";
import { useEffect, useState, useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const stats = [
  { label: "Member States", target: 12 },
  { label: "Programmes", target: 7 },
  { label: "Parliament Seats", target: 115 },
  { label: "Years", target: 25 },
];

const CountUpNumber = ({ target, delay = 0 }: { target: number; delay?: number }) => {
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
        if (current >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
    }, delay);
    return () => clearTimeout(timer);
  }, [isVisible, target, delay]);

  return <span ref={ref as React.RefObject<HTMLSpanElement>}>{count}</span>;
};

/* Floating particle */
const Particle = ({ size, x, y, delay, color }: { size: number; x: string; y: string; delay: string; color: string }) => (
  <div
    className="absolute rounded-full animate-particle pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      animationDelay: delay,
      background: color,
      opacity: 0.35,
    }}
  />
);

const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-hero text-primary-foreground">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 animate-gradient-shift opacity-30" style={{
        background: "linear-gradient(135deg, hsl(152 100% 26% / 0.4), hsl(50 87% 45% / 0.15), hsl(340 66% 34% / 0.1), hsl(152 100% 20% / 0.3))",
        backgroundSize: "400% 400%",
      }} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Particle size={6} x="8%" y="15%" delay="0s" color="hsl(50 87% 45%)" />
        <Particle size={4} x="25%" y="70%" delay="1.2s" color="hsl(152 100% 40%)" />
        <Particle size={8} x="75%" y="20%" delay="0.5s" color="hsl(50 87% 45%)" />
        <Particle size={5} x="90%" y="60%" delay="2s" color="hsl(73 53% 49%)" />
        <Particle size={3} x="60%" y="80%" delay="0.8s" color="hsl(152 100% 30%)" />
        <Particle size={7} x="40%" y="10%" delay="1.5s" color="hsl(340 66% 50%)" />
        <Particle size={4} x="15%" y="50%" delay="2.5s" color="hsl(190 35% 53%)" />
        <Particle size={6} x="85%" y="40%" delay="3s" color="hsl(50 87% 45%)" />
        <Particle size={5} x="50%" y="90%" delay="1s" color="hsl(73 53% 49%)" />
        <Particle size={3} x="35%" y="35%" delay="3.5s" color="hsl(152 100% 40%)" />
      </div>

      {/* Geometric blur shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-float" />
        <div className="absolute top-[55%] right-[5%] w-56 h-56 rounded-full bg-ecowas-yellow/6 blur-3xl animate-float" style={{ animationDelay: "1.2s" }} />
        <div className="absolute bottom-[10%] left-[20%] w-44 h-44 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: "0.6s" }} />
      </div>

      <div className="container relative py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-sm backdrop-blur-sm bg-primary-foreground/5 animate-slide-up">
              <span className="h-2 w-2 rounded-full bg-ecowas-yellow animate-pulse-dot" />
              ECOWAS Parliament Initiatives
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] animate-slide-up" style={{ animationDelay: "0.1s" }}>
              ECOWAS Parliament{" "}
              <span className="text-ecowas-yellow relative">
                @25
                <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-ecowas-yellow/30 rounded-full" />
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-foreground/80 block mt-3">
                A Year-Long Movement Across Borders
              </span>
            </h1>

            <p className="text-lg text-primary-foreground/70 max-w-lg leading-relaxed animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Not a celebration confined to a date, but a year-long movement across borders,
              generations, and sectors — reaffirming the promise of a more connected,
              inclusive, and prosperous West Africa.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button asChild size="lg" className="bg-ecowas-yellow text-background hover:bg-ecowas-yellow/90 font-bold shadow-lg hover:shadow-xl transition-all group">
                <Link to="/about">
                  Explore the Programme
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm">
                <Link to="/timeline">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Timeline
                </Link>
              </Button>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <SocialMediaBar
                variant="icons-only"
                showParliamentLink={false}
                className="[&_a]:bg-primary-foreground/10 [&_a]:text-primary-foreground/70 [&_a:hover]:bg-primary-foreground/20 [&_a:hover]:text-primary-foreground [&_a]:backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex justify-center lg:justify-end animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-ecowas-yellow/20 rounded-full blur-3xl scale-125 animate-pulse" style={{ animationDuration: "4s" }} />
              <div className="absolute -inset-8 rounded-full border border-primary-foreground/5 animate-spin-slow" />
              <div className="absolute -inset-16 rounded-full border border-dashed border-primary-foreground/5 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "25s" }} />
              <img
                src={anniversary25Logo}
                alt="ECOWAS Parliament 25th Anniversary"
                className="relative w-64 md:w-80 lg:w-96 h-auto animate-float"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          {stats.map((stat, i) => (
            <div key={stat.label} className="group text-center p-6 rounded-2xl backdrop-blur-md bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all duration-300">
              <p className="text-3xl md:text-4xl font-black text-ecowas-yellow group-hover:scale-110 transition-transform duration-300 inline-block">
                <CountUpNumber target={stat.target} delay={i * 200} />
              </p>
              <p className="text-sm text-primary-foreground/60 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
