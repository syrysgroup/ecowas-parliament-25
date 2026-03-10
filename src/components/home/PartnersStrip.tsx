import duchessLogo from "@/assets/duchess-logo.png";
import cmdLogo from "@/assets/cmd-logo.png";
import borderlessLogo from "@/assets/borderless-trade-logo.png";
import AnimatedSection from "@/components/shared/AnimatedSection";

const partners = [
  { name: "Duchess NL", logo: duchessLogo },
  { name: "CMD Tourism & Trade Enterprises", logo: cmdLogo },
  { name: "Borderless Trade & Investment", logo: borderlessLogo },
];

const PartnersStrip = () => {
  return (
    <section className="py-14 bg-muted/50 border-y border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-8">
          <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
            Implementing Partners
          </p>
        </AnimatedSection>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {partners.map((partner, i) => (
            <AnimatedSection key={partner.name} delay={i * 100}>
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-14 md:h-16 w-auto grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;
