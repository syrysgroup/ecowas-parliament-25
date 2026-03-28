import AnimatedSection from "@/components/shared/AnimatedSection";

const PartnersStrip = () => {
  return (
    <section className="py-10 bg-muted/50 border-y border-border">
      <div className="container">
        <AnimatedSection className="text-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">
            Implementing Partner
          </p>
          <p className="text-lg font-bold text-foreground">AWALCO</p>
          <p className="text-sm text-muted-foreground mt-1">
            Association of West African Living Councils
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PartnersStrip;
