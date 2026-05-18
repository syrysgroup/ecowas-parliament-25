import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Maximize2 } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import parliamentChamber from "@/assets/parliament-chamber.png";

export default function ParliamentTourSpotlight() {
  return (
    <section className="py-20 bg-gradient-to-br from-ecowas-green/5 via-background to-ecowas-yellow/5">
      <div className="container">
        <AnimatedSection>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <Link to="/parliament-tour" className="group relative block overflow-hidden rounded-3xl shadow-2xl">
              <img
                src={parliamentChamber}
                alt="ECOWAS Parliament Chamber 360° preview"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-ecowas-yellow text-ecowas-green-foreground flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Compass className="h-9 w-9" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <span className="text-sm font-bold uppercase tracking-wider">360° Tour</span>
                <span className="text-xs opacity-80 inline-flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" /> Click to explore
                </span>
              </div>
            </Link>

            <div className="space-y-5">
              <Badge className="bg-primary/10 text-primary border-primary/20">Virtual Experience</Badge>
              <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight">
                Step Inside the <span className="text-primary">Parliament Chamber</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Tour the seat of West African parliamentary democracy in immersive 360°.
                Look around the chamber, discover the Speaker's chair, member benches and public
                gallery — all from anywhere in the world.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/parliament-tour">
                    Launch 360° Tour <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/ecowas-parliament">About the Parliament</Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}