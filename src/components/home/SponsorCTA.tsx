import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import SocialMediaBar from "@/components/shared/SocialMediaBar";
import AnimatedSection from "@/components/shared/AnimatedSection";

const SponsorCTA = () => {
  return (
    <section className="py-20 bg-gradient-hero text-primary-foreground">
      <div className="container">
        <AnimatedSection className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-sm mb-6">
            <Heart className="h-4 w-4 text-ecowas-yellow" />
            Support the Movement
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Become a Sponsor of <span className="text-ecowas-yellow">ECOWAS Parliament Initiatives</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8 leading-relaxed">
            Join organisations supporting parliamentary democracy, youth empowerment, trade integration, and cultural celebration across 12 West African member states.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button asChild size="lg" className="bg-ecowas-yellow text-accent-foreground hover:bg-ecowas-yellow/90 font-bold">
              <Link to="/sponsors">
                Sponsor the Programme
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
          <SocialMediaBar
            variant="icons-only"
            showParliamentLink={false}
            className="flex justify-center [&_a]:bg-primary-foreground/10 [&_a]:text-primary-foreground/70 [&_a:hover]:bg-primary-foreground/20 [&_a:hover]:text-primary-foreground"
          />
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SponsorCTA;
