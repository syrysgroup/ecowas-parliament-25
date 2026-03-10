import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import anniversary25Logo from "@/assets/parliament-25-logo.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      {/* Background announcement photo */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: "url('/announcement/25.jpg')" }}
      />
      {/* Decorative circles */}
      <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-ecowas-yellow/5 blur-3xl" />

      <div className="container relative py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-ecowas-yellow animate-pulse-dot" />
              January – November 2026
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight animate-slide-up">
              ECOWAS Parliament{" "}
              <span className="text-ecowas-yellow">@25</span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-foreground/80">
                A Year-Long Movement
              </span>
            </h1>

            <p className="text-lg text-primary-foreground/70 max-w-lg leading-relaxed animate-slide-up" style={{ animationDelay: "0.15s" }}>
              Not a celebration confined to a date, but a year-long movement across borders,
              generations, and sectors — reaffirming the promise of a more connected,
              inclusive, and prosperous West Africa.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button asChild size="lg" className="bg-ecowas-yellow text-accent-foreground hover:bg-ecowas-yellow/90 font-bold shadow-lg shadow-ecowas-yellow/25">
                <Link to="/about">
                  Explore the Programme
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold shadow-lg">
                <Link to="/timeline">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Timeline
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-ecowas-yellow/20 rounded-full blur-3xl scale-110" />
              <img
                src={anniversary25Logo}
                alt="ECOWAS Parliament 25th Anniversary"
                className="relative w-64 md:w-80 lg:w-96 h-auto animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
