import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { useSiteContent } from "@/hooks/useSiteContent";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

const AboutSection = () => {
  const { t } = useTranslation();
  const { data: db } = useSiteContent("about");
  const { data: statsDb } = useSiteContent("stats");

  const stats = [
    { value: statsDb?.stat1_value || "25", label: statsDb?.stat1_label || t("anniversary.stat1"), color: "text-accent" },
    { value: statsDb?.stat2_value || "12", label: statsDb?.stat2_label || t("anniversary.stat2"), color: "text-primary" },
    { value: statsDb?.stat3_value || "7", label: statsDb?.stat3_label || t("anniversary.stat3"), color: "text-ecowas-blue" },
    { value: statsDb?.stat4_value || "1,200+", label: statsDb?.stat4_label || t("anniversary.stat4"), color: "text-ecowas-lime" },
  ];

  const tags = [t("anniversary.tag1"), t("anniversary.tag2"), t("anniversary.tag3"), t("anniversary.tag4"), t("anniversary.tag5")];

  const title = db?.title || `${t("anniversary.title")} ${t("anniversary.titleAccent")}`;
  const desc1 = db?.description || t("anniversary.p1");

  return (
    <section className="py-20 bg-muted/20 border-t border-b border-border">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">{t("about.heroTitle")}</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-6">
              {title}
            </h2>
            <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
              <p>{desc1}</p>
              <p>{t("about.livingDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {tags.map((tag) => (
                <span key={tag} className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground">{tag}</span>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
                  <p className={`text-4xl font-black leading-none mb-1.5 ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-3.5 bg-card border border-border rounded-2xl p-4">
                <div className="bg-white rounded-full p-1.5 shadow-sm shrink-0">
                  <img src={ecowasLogo} alt="ECOWAS Parliament" className="h-9 w-9 object-contain" width={36} height={36} loading="lazy" decoding="async" />
                </div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">ECOWAS Parliament</p>
                  <p className="text-[11px] text-muted-foreground">Herbert Macaulay Way, Central Business District, P.M.B. 576, Abuja, Nigeria</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
