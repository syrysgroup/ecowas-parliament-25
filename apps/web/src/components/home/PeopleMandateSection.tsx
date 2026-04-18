import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Users, Shield, Globe, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import parliamentChamber from "@/assets/parliament-chamber.png";

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
        {/* Two-column hero — text left, image right (visible from md breakpoint) */}
        <AnimatedSection className="mb-14">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* Text column */}
            <div className="space-y-4">
              <Badge className="bg-ecowas-yellow/90 text-accent-foreground border-0 text-xs font-bold">
                Founded 16 November 2000 · 25th Anniversary
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                {t("mandate.title")} <span className="text-primary">{t("mandate.titleAccent")}</span>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
                {t("mandate.desc")}
              </p>
              <div className="flex gap-3 flex-wrap pt-2">
                <Button asChild className="gap-2">
                  <Link to="/ecowas-parliament">
                    About ECOWAS Parliament Initiatives <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Landscape image column — reduced height */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-xl border border-border">
                <img
                  src={parliamentChamber}
                  alt="ECOWAS Parliament Initiatives during the 25th Anniversary ordinary session in Abuja"
                  className="w-full aspect-[16/9] max-h-64 object-cover object-center"
                  loading="lazy"
                />
              </div>
              <p className="text-muted-foreground text-xs mt-2 italic text-center">
                ECOWAS Parliament Initiatives during the 25th Anniversary ordinary session in Abuja
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Four pillar cards */}
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
