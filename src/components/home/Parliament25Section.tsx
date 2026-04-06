import AnimatedSection from "@/components/shared/AnimatedSection";
import { useTranslation } from "@/lib/i18n";
import parliament25Logo from "@/assets/parliament-25-logo.png";

const Parliament25Section = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <AnimatedSection className="flex justify-center">
            <img src={parliament25Logo} alt={t("anniversary.badge")} className="h-48 md:h-64 lg:h-72 w-auto object-contain drop-shadow-[0_0_30px_hsl(152_100%_26%/0.15)]" width={288} height={288} loading="lazy" decoding="async" />
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              {t("anniversary.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-5">
              {t("anniversary.headingPrefix")} <span className="text-primary">25</span>
            </h2>
            <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
              <p>{t("anniversary.p1")}</p>
              <p>{t("anniversary.p2")}</p>
              <p>{t("anniversary.p3")}</p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Parliament25Section;
