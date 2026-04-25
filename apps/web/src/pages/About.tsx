import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Target, Globe, Users, Handshake } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useSiteContent } from "@/hooks/useSiteContent";

const FOCUS_ICONS = [Target, Users, Globe, Handshake];

const About = () => {
  const { t } = useTranslation();
  const { data: cms } = useSiteContent("parliament_initiative");

  const get = (key: string, fallback: string) => cms?.[key] || fallback;

  const focusAreas = [
    {
      icon: FOCUS_ICONS[0],
      title: get("focus1_title", t("about.focus1.title")),
      desc:  get("focus1_desc",  t("about.focus1.desc")),
    },
    {
      icon: FOCUS_ICONS[1],
      title: get("focus2_title", t("about.focus2.title")),
      desc:  get("focus2_desc",  t("about.focus2.desc")),
    },
    {
      icon: FOCUS_ICONS[2],
      title: get("focus3_title", t("about.focus3.title")),
      desc:  get("focus3_desc",  t("about.focus3.desc")),
    },
    {
      icon: FOCUS_ICONS[3],
      title: get("focus4_title", t("about.focus4.title")),
      desc:  get("focus4_desc",  t("about.focus4.desc")),
    },
  ];

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">
              {get("hero_title", t("nav.parliamentInitiative"))}
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              {get("hero_desc", t("about.heroDesc"))}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl space-y-16">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {get("why_title", t("about.whyTitle"))}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {get("why_desc", t("about.whyDesc"))}
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {get("living_title", t("about.livingTitle"))}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {get("living_desc", t("about.livingDesc"))}
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {get("focus_title", t("about.focusTitle"))}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {focusAreas.map((item) => (
                <div key={item.title} className="flex gap-4 p-5 rounded-xl bg-card border border-border">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {get("partnerships_title", t("about.partnershipsTitle"))}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {get("partnerships_desc", t("about.partnershipsDesc"))}
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {get("vision_title", t("about.visionTitle"))}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {get("vision_desc", t("about.visionDesc"))}
            </p>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default About;
