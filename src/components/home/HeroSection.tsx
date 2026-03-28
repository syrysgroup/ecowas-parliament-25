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

const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-hero text-primary-foreground">
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-float" />
        <div className="absolute top-[60%] right-[8%] w-48 h-48 rounded-full bg-ecowas-yellow/6 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[30%] right-[20%] w-32 h-32 rounded-full bg-ecowas-lime/5 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[15%] left-[15%] w-40 h-40 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: "0.5s" }} />
        {/* Geometric accents */}
        <div className="absolute top-20 right-[10%] w-2 h-2 rounded-full bg-ecowas-yellow/40 animate-pulse-dot" />
        <div className="absolute top-[40%] left-[12%] w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse-dot" style={{ animationDelay: "0.7s" }} />
        <div className="absolute bottom-[30%] right-[25%] w-2.5 h-2.5 rounded-full bg-ecowas-lime/30 animate-pulse-dot" style={{ animationDelay: "1.4s" }} />
      </div>

      <div className="container relative py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-sm backdrop-blur-sm bg-primary-foreground/5 animate-slide-up">
              <span className="h-2 w-2 rounded-full bg-ecowas-yellow animate-pulse-dot" />
              ECOWAS Parliament Initiatives
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight animate-slide-up" style={{ animationDelay: "0.1s" }}>
              ECOWAS Parliament{" "}
              <span className="text-ecowas-yellow">@25</span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-foreground/80">
                A Year-Long Movement
              </span>
            </h1>

            <p className="text-lg text-primary-foreground/70 max-w-lg leading-relaxed animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Not a celebration confined to a date, but a year-long movement across borders,
              generations, and sectors — reaffirming the promise of a more connected,
              inclusive, and prosperous West Africa.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button asChild size="lg" className="bg-ecowas-yellow text-accent-foreground hover:bg-ecowas-yellow/90 font-bold shadow-lg hover:shadow-xl transition-all">
                <Link to="/about">
                  Explore the Programme
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm">
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
              <div className="absolute inset-0 bg-ecowas-yellow/20 rounded-full blur-3xl scale-110 animate-pulse" style={{ animationDuration: "4s" }} />
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
            <div key={stat.label} className="text-center p-5 rounded-2xl backdrop-blur-md bg-primary-foreground/5 border border-primary-foreground/10">
              <p className="text-3xl md:text-4xl font-black text-ecowas-yellow">
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
