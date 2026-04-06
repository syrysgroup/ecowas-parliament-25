import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

interface PillarRow {
  id: string;
  slug: string;
  emoji: string | null;
  color: string | null;
  icon_bg: string | null;
  route: string | null;
  progress_percent: number;
  lead_name: string | null;
  sponsors: string[];
  display_order: number;
}

const PillarsGrid = () => {
  const { t } = useTranslation();

  const { data: pillars = [], isLoading } = useQuery<PillarRow[]>({
    queryKey: ["programme_pillars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programme_pillars" as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              {t("pillars.badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
              {t("pillars.title")}<br />{t("pillars.title2")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl leading-relaxed">
              {t("pillars.subtitle")}
            </p>
          </AnimatedSection>
          <Link to="/about" className="text-sm text-primary font-bold hover:gap-2.5 inline-flex items-center gap-1.5 transition-all">
            {t("pillars.allProgrammes")}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))
            : pillars.map((pillar, i) => (
                <AnimatedSection key={pillar.id} delay={i * 80}>
                  <Link
                    to={pillar.route ?? `/programmes/${pillar.slug}`}
                    className="group relative block p-5 rounded-2xl border border-border bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                      style={{ background: pillar.color ?? "hsl(152 100% 26%)" }}
                    />
                    <div className={`w-11 h-11 rounded-lg ${pillar.icon_bg ?? "bg-primary/10"} flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                      {pillar.emoji}
                    </div>
                    <h3 className="text-base font-bold text-card-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                      {t(`pillars.${pillar.slug}.title`)}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3.5">
                      {t(`pillars.${pillar.slug}.desc`)}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-muted-foreground">{pillar.progress_percent}%</span>
                      <div className="flex-1">
                        <Progress value={pillar.progress_percent} className="h-[3px]" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{pillar.lead_name}</span>
                    </div>
                    <div className="max-h-0 overflow-hidden group-hover:max-h-16 group-hover:border-t group-hover:border-border group-hover:mt-3.5 group-hover:pt-3 transition-all duration-300">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {t("pillars.sponsors")}
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {(pillar.sponsors ?? []).length > 0 ? (
                          pillar.sponsors.map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-semibold">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground font-semibold italic opacity-50">
                            {t("pillars.open")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsGrid;
