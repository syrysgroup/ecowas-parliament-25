import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Users, Shield, Globe, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useSiteContent } from "@/hooks/useSiteContent";
import parliamentChamber from "@/assets/parliament-chamber.png";

const PeopleMandateSection = () => {
 const { t } = useTranslation();
 const { data: cms } = useSiteContent("mandate");

 const pillars = [
 { icon: <Scale className="h-6 w-6" />, title: cms?.pillar1_title ?? t("mandate.pillar1Title"), desc: cms?.pillar1_desc ?? t("mandate.pillar1Desc"), color: "bg-primary/10 text-primary" },
 { icon: <Users className="h-6 w-6" />, title: cms?.pillar2_title ?? t("mandate.pillar2Title"), desc: cms?.pillar2_desc ?? t("mandate.pillar2Desc"), color: "bg-accent/10 text-accent" },
 { icon: <Shield className="h-6 w-6" />, title: cms?.pillar3_title ?? t("mandate.pillar3Title"), desc: cms?.pillar3_desc ?? t("mandate.pillar3Desc"), color: "bg-secondary/10 text-secondary" },
 { icon: <Globe className="h-6 w-6" />, title: cms?.pillar4_title ?? t("mandate.pillar4Title"), desc: cms?.pillar4_desc ?? t("mandate.pillar4Desc"), color: "bg-ecowas-blue/10 text-ecowas-blue" },
 ];

 const badge = cms?.badge ?? "Founded 16 November 2000 · 25th Anniversary";
 const title = cms?.title ?? t("mandate.title");
 const titleAccent = cms?.title_accent ?? t("mandate.titleAccent");
 const description = cms?.description ?? t("mandate.desc");
 const ctaLabel = cms?.cta_label ?? "About ECOWAS Parliament Initiatives";
 const ctaHref = cms?.cta_href ?? "/ecowas-parliament";
 const imageCaption = cms?.image_caption ?? "ECOWAS Parliament Initiatives during the 25th Anniversary ordinary session in Abuja";
 const quote = cms?.quote ?? t("mandate.quote");
 const quoteAttr = cms?.quote_attr ?? t("mandate.quoteAttr");

 return (
 <section className="py-20 bg-gradient-to-b from-background to-muted/30">
 <div className="container">
 <AnimatedSection className="mb-14">
 <div className="grid gap-8 md:grid-cols-2 items-center">
 <div className="space-y-4">
 <Badge className="bg-ecowas-yellow/90 text-accent-foreground border-0 text-xs font-bold">
 {badge}
 </Badge>
 <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
 {title} <span className="text-primary">{titleAccent}</span>
 </h2>
 <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
 {description}
 </p>
 <div className="flex gap-3 flex-wrap pt-2">
 <Button asChild className="gap-2">
 <Link to={ctaHref}>
 {ctaLabel} <ArrowRight className="h-4 w-4" />
 </Link>
 </Button>
 </div>
 </div>

 <div className="relative">
 <div className="overflow-hidden rounded-2xl shadow-xl border border-border">
 <img
 src={parliamentChamber}
 alt={imageCaption}
 className="w-full aspect-[16/9] max-h-64 object-cover object-center"
 loading="lazy"
 />
 </div>
 <p className="text-muted-foreground text-xs mt-2 italic text-center">
 {imageCaption}
 </p>
 </div>
 </div>
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
 "{quote}"
 </blockquote>
 <p className="text-sm text-muted-foreground mt-3">{quoteAttr}</p>
 </AnimatedSection>
 </div>
 </section>
 );
};

export default PeopleMandateSection;
