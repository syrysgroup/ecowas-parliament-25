import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { Building2, Scale, ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const institutionalPartners = [
  { name: "AWALCO", fullNameKey: "instPartners.awalco.fullName", descKey: "instPartners.awalco.desc", icon: Building2, accent: "bg-ecowas-blue/10 text-ecowas-blue", slug: "awalco" },
  { name: "Alliance for Economic Research and Ethics LTD/GTE", fullNameKey: "instPartners.alliance.fullName", descKey: "instPartners.alliance.desc", icon: Scale, accent: "bg-accent/10 text-accent", slug: "alliance-economic-research" },
];

const InstitutionalPartnersSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-ecowas-blue/10 border border-ecowas-blue/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ecowas-blue mb-4">
            {t("instPartners.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("instPartners.title")} <span className="text-ecowas-blue">{t("instPartners.titleAccent")}</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t("instPartners.subtitle")}</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {institutionalPartners.map((partner, i) => {
            const Icon = partner.icon;
            return (
              <AnimatedSection key={partner.name} delay={i * 100}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-ecowas-blue/30 transition-all hover:shadow-lg group h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${partner.accent} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-card-foreground">{partner.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t(partner.fullNameKey)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{t(partner.descKey)}</p>
                  <Link to={`/partners/${partner.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    {t("common.learnMore")} <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InstitutionalPartnersSection;
