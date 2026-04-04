import AnimatedSection from "@/components/shared/AnimatedSection";
import { useTranslation } from "@/lib/i18n";

const PartnersStrip = () => {
  const { t } = useTranslation();

  return (
    <section className="py-10 bg-muted/50 border-y border-border">
      <div className="container">
        <AnimatedSection className="text-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">
            {t("nav.partners")}
          </p>
          <p className="text-lg font-bold text-foreground">AWALCO</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("instPartners.awalco.fullName")}
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PartnersStrip;
