import AnimatedSection from "@/components/shared/AnimatedSection";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ExternalLink, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import speakerImg from "@/assets/speaker-memounatou.jpeg";

const SpeakerSection = () => {
  const { t } = useTranslation();

  const { data: speakerContent } = useQuery({
    queryKey: ["site-content", "speaker"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("site_content")
        .select("content")
        .eq("section_key", "speaker")
        .maybeSingle();
      return data?.content as { name?: string; title?: string; quote?: string; image_url?: string } | null;
    },
  });

  const speakerName  = speakerContent?.name      || t("speaker.name");
  const speakerTitle = speakerContent?.title     || t("speaker.title");
  const speakerQuote = speakerContent?.quote     || `${t("speaker.quote")} ${t("speaker.ecowasStates")} ${t("speaker.ecowasTo")} ${t("speaker.ecowasPeople")}`;
  const speakerImage = speakerContent?.image_url || speakerImg;

  return (
    <section className="py-16 bg-muted/30 border-b border-border">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-10 items-center max-w-5xl mx-auto">
          <AnimatedSection className="lg:col-span-2 flex justify-center">
            <div className="relative">
              <div className="w-64 h-80 md:w-72 md:h-[22rem] rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl">
                <img src={speakerImage} alt={speakerName} className="w-full h-full object-cover object-top" width={288} height={352} loading="lazy" decoding="async" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-accent opacity-20 -z-10" />
              <div className="absolute -top-3 -left-3 w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-primary opacity-15 -z-10" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200} className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t("speaker.badge")}
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-2xl md:text-3xl font-black text-foreground leading-tight">{speakerName}</p>
                <p className="text-sm font-semibold text-primary mt-1">{speakerTitle}</p>
              </div>
            </div>

            <div className="relative pl-5 border-l-[3px] border-accent">
              <p className="text-[15px] text-muted-foreground leading-relaxed italic">
                "{speakerQuote}"
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {[t("speaker.tag1"), t("speaker.tag2"), t("speaker.tag3")].map((tag) => (
                <span key={tag} className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground">{tag}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                <a href="https://www.parl.ecowas.int/the-speaker-6th-legislature/" target="_blank" rel="noopener noreferrer">
                  <User className="mr-2 h-4 w-4" />{t("speaker.aboutSpeaker")}
                </a>
              </Button>
              <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 font-semibold">
                <a href="https://www.parl.ecowas.int" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />{t("speaker.officialSite")}
                </a>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default SpeakerSection;
