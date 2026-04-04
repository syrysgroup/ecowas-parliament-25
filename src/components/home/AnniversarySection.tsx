import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import parliament25Logo from "@/assets/parliament-25-logo.png";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

const AnniversarySection = () => {
  const { t } = useTranslation();

  const stats = [
    { value: "25", label: t("anniversary.stat1"), color: "text-accent" },
    { value: "12", label: t("anniversary.stat2"), color: "text-primary" },
    { value: "7", label: t("anniversary.stat3"), color: "text-ecowas-blue" },
    { value: "1,200+", label: t("anniversary.stat4"), color: "text-ecowas-lime" },
  ];

  const tags = [t("anniversary.tag1"), t("anniversary.tag2"), t("anniversary.tag3"), t("anniversary.tag4"), t("anniversary.tag5")];

  return (
    <section className="py-20 bg-muted/20 border-t border-b border-border">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Logo + Stats underneath */}
          <div>
            <AnimatedSection className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-muted border-4 border-ecowas-green shadow-xl flex items-center justify-center">
                  <img src={parliament25Logo} alt={t("anniversary.badge")} className="h-56 md:h-64 w-auto object-contain drop-shadow-[0_0_30px_hsl(152_100%_26%/0.15)]" />
                </div>
                <div className="absolute inset-0 w-72 h-72 md:w-80 md:h-80 rounded-full border-2 border-ecowas-green/20 scale-110" />
              </div>
            </AnimatedSection>

            {/* Stats grid below logo */}
            <AnimatedSection delay={200} className="mt-8">
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
                    <p className={`text-4xl font-black leading-none mb-1.5 ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Right: Text content */}
          <div>
            <AnimatedSection delay={100}>
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">{t("anniversary.badge")}</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-5">
                {t("anniversary.title")} <span className="text-primary">{t("anniversary.titleAccent")}</span>
              </h2>
              <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
                <p>{t("anniversary.p1")}</p>
                <p>{t("anniversary.p2")}</p>
                <p>{t("anniversary.p3")}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {tags.map((tag) => (
                  <span key={tag} className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground">{tag}</span>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={300} className="mt-8">
              <div className="flex items-center gap-3.5 bg-card border border-border rounded-2xl p-4">
                <div className="bg-white rounded-full p-1.5 shadow-sm shrink-0">
                  <img src={ecowasLogo} alt="ECOWAS Parliament" className="h-9 w-9 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">ECOWAS Parliament</p>
                  <p className="text-[11px] text-muted-foreground">Herbert Macaulay Way, Central Business District, P.M.B. 576, Abuja, Nigeria</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnniversarySection;
