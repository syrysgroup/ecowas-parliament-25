import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Users, Shield, Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const PeopleMandateSection = () => {
  const { t } = useTranslation();

  const pillars = [
    { icon: <Scale className="h-6 w-6" />, title: t("mandate.pillar1Title"), desc: t("mandate.pillar1Desc"), color: "bg-primary/10 text-primary" },
    { icon: <Users className="h-6 w-6" />, title: t("mandate.pillar2Title"), desc: t("mandate.pillar2Desc"), color: "bg-accent/10 text-accent" },
    { icon: <Shield className="h-6 w-6" />, title: t("mandate.pillar3Title"), desc: t("mandate.pillar3Desc"), color: "bg-secondary/10 text-secondary" },
    { icon: <Globe className="h-6 w-6" />, title: t("mandate.pillar4Title"), desc: t("mandate.pillar4Desc"), color: "bg-ecowas-blue/10 text-ecowas-blue" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">{t("mandate.badge")}</Badge>
          <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-4">
            {t("mandate.title")} <span className="text-primary">{t("mandate.titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("mandate.desc")}</p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${pillar.color} flex items-center justify-center mb-4`}>
                    {pillar.icon}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={500} className="mt-12 text-center">
          <blockquote className="text-lg md:text-xl italic text-muted-foreground max-w-2xl mx-auto border-l-4 border-primary pl-6 text-left">
            "{t("mandate.quote")}"
          </blockquote>
          <p className="text-sm text-muted-foreground mt-3">{t("mandate.quoteAttr")}</p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PeopleMandateSection;
