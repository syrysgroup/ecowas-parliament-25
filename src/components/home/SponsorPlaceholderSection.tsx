import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";

const SponsorPlaceholderSection = () => {
  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-6">
            <Handshake className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            ECOWAS Parliament Initiative <span className="text-primary">Sponsors</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            We are welcoming sponsors and institutional partners to support the 25th Anniversary programme across West Africa.
          </p>
          <Link
            to="/sponsors"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Become a Sponsor
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SponsorPlaceholderSection;
