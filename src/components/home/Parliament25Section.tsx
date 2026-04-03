import AnimatedSection from "@/components/shared/AnimatedSection";
import parliament25Logo from "@/assets/parliament-25-logo.png";

const Parliament25Section = () => {
  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Logo */}
          <AnimatedSection className="flex justify-center">
            <img
              src={parliament25Logo}
              alt="Parliament at 25 Anniversary Logo"
              className="h-48 md:h-64 lg:h-72 w-auto object-contain drop-shadow-[0_0_30px_hsl(152_100%_26%/0.15)]"
            />
          </AnimatedSection>

          {/* Write-up */}
          <AnimatedSection delay={150}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              🏛️ The Anniversary Identity
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-5">
              Parliament at <span className="text-primary">25</span>
            </h2>
            <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
              <p>
                The "Parliament at 25" emblem represents a quarter century of democratic
                representation in West Africa. It symbolises the unity of 12 member states
                under a shared parliamentary vision — promoting integration, the rule of law,
                and the aspirations of over 400 million West Africans.
              </p>
              <p>
                Designed to mark the silver jubilee of the ECOWAS Parliament, the identity
                captures the essence of collective governance, regional solidarity, and the
                progressive ideals that have guided the institution since its inaugural
                session in Abuja.
              </p>
              <p>
                The anniversary programme spans seven pillars — from youth empowerment and
                trade diplomacy to cultural celebration and civic education — each reflecting
                the Parliament's enduring commitment to the people it serves.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Parliament25Section;
