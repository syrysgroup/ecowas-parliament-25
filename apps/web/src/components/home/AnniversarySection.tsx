import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import parliament25Logo from "@/assets/parliament-25-logo.png";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

interface StatContent {
  stat1_value?: string; stat1_label?: string;
  stat2_value?: string; stat2_label?: string;
  stat3_value?: string; stat3_label?: string;
  stat4_value?: string; stat4_label?: string;
}

const STAT_COLORS = ["text-accent", "text-primary", "text-ecowas-blue", "text-ecowas-lime"];

const AnniversarySection = () => {
  const { t } = useTranslation();

  const { data: content, isLoading } = useQuery<StatContent | null>({
    queryKey: ["site-content", "anniversary_stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "anniversary_stats")
        .maybeSingle();
      return (data?.content as StatContent) ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });

  const stats = content
    ? [
        { value: content.stat1_value ?? "25",     label: content.stat1_label ?? t("anniversary.stat1"), color: STAT_COLORS[0] },
        { value: content.stat2_value ?? "12",     label: content.stat2_label ?? t("anniversary.stat2"), color: STAT_COLORS[1] },
        { value: content.stat3_value ?? "7",      label: content.stat3_label ?? t("anniversary.stat3"), color: STAT_COLORS[2] },
        { value: content.stat4_value ?? "1,200+", label: content.stat4_label ?? t("anniversary.stat4"), color: STAT_COLORS[3] },
      ]
    : [
        { value: "25",     label: t("anniversary.stat1"), color: STAT_COLORS[0] },
        { value: "12",     label: t("anniversary.stat2"), color: STAT_COLORS[1] },
        { value: "7",      label: t("anniversary.stat3"), color: STAT_COLORS[2] },
        { value: "1,200+", label: t("anniversary.stat4"), color: STAT_COLORS[3] },
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
                  <img
                    src={parliament25Logo}
                    alt={t("anniversary.badge")}
                    className="h-56 md:h-64 w-auto object-contain drop-shadow-[0_0_30px_hsl(152_100%_26%/0.15)]"
                    loading="lazy"
                    width={256}
                    height={256}
                    decoding="async"
                  />
                </div>
                <div className="absolute inset-0 w-72 h-72 md:w-80 md:h-80 rounded-full border-2 border-ecowas-green/20 scale-110" />
              </div>
            </AnimatedSection>

            {/* Stats grid below logo */}
            <AnimatedSection delay={200} className="mt-8">
              <div className="grid grid-cols-2 gap-3">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))
                  : stats.map((stat) => (
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
                  <img
                    src={ecowasLogo}
                    alt="ECOWAS Parliament Initiatives"
                    className="h-9 w-9 object-contain"
                    loading="lazy"
                    width={36}
                    height={36}
                    decoding="async"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">ECOWAS Parliament Initiatives</p>
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
