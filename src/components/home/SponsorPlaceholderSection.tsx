import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";
import SponsorLogo from "@/components/shared/SponsorLogo";

const mockSponsors = [
  { name: "West African Development Bank", color: "hsl(var(--ecowas-blue))" },
  { name: "ECOWAS Commission", color: "hsl(var(--ecowas-green))" },
  { name: "African Union", color: "hsl(var(--accent))" },
  { name: "United Nations Development Programme", color: "hsl(var(--primary))" },
  { name: "GIZ West Africa", color: "hsl(var(--secondary))" },
  { name: "Access Bank Group", color: "hsl(var(--ecowas-yellow))" },
];

const SponsorPlaceholderSection = () => {
  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-6">
            <Handshake className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            ECOWAS Parliament Initiative <span className="text-primary">Sponsors</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Organisations supporting the 25th Anniversary programme across West Africa
          </p>
        </AnimatedSection>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {mockSponsors.map((sponsor, i) => (
            <AnimatedSection key={sponsor.name} delay={i * 50}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                <SponsorLogo name={sponsor.name} color={sponsor.color} size={40} />
                <span className="text-sm font-semibold text-card-foreground">{sponsor.name}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center">
          <Link
            to="/sponsors"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Become a Sponsor
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SponsorPlaceholderSection;
