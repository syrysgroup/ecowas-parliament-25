import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Target, Globe, Users, Handshake } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const About = () => {
  const { t } = useTranslation();

  const focusAreas = [
    { icon: Target, titleKey: "about.focus1.title", descKey: "about.focus1.desc" },
    { icon: Users, titleKey: "about.focus2.title", descKey: "about.focus2.desc" },
    { icon: Globe, titleKey: "about.focus3.title", descKey: "about.focus3.desc" },
    { icon: Handshake, titleKey: "about.focus4.title", descKey: "about.focus4.desc" },
  ];

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">{t("about.heroTitle")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("about.heroDesc")}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl space-y-16">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t("about.whyTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("about.whyDesc")}</p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t("about.livingTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("about.livingDesc")}</p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6">{t("about.focusTitle")}</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {focusAreas.map((item) => (
                <div key={item.titleKey} className="flex gap-4 p-5 rounded-xl bg-card border border-border">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground">{t(item.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{t(item.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t("about.partnershipsTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("about.partnershipsDesc")}</p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t("about.visionTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("about.visionDesc")}</p>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default About;
