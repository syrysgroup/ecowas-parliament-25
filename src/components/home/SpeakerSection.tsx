import AnimatedSection from "@/components/shared/AnimatedSection";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ExternalLink, User } from "lucide-react";
import speakerImg from "@/assets/speaker-memounatou.jpeg";

const SpeakerSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-muted/30 border-b border-border">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-10 items-center max-w-5xl mx-auto">
          {/* Portrait */}
          <AnimatedSection className="lg:col-span-2 flex justify-center">
            <div className="relative">
              <div className="w-64 h-80 md:w-72 md:h-[22rem] rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl">
                <img
                  src={speakerImg}
                  alt={t("speaker.name")}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-accent opacity-20 -z-10" />
              <div className="absolute -top-3 -left-3 w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-primary opacity-15 -z-10" />
            </div>
          </AnimatedSection>

          {/* Text content */}
          <AnimatedSection delay={200} className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t("speaker.badge")}
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-2xl md:text-3xl font-black text-foreground leading-tight">
                  {t("speaker.name")}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">{t("speaker.title")}</p>
              </div>
            </div>

            {/* Quote / description */}
            <div className="relative pl-5 border-l-[3px] border-accent">
              <p className="text-[15px] text-muted-foreground leading-relaxed italic">
                "{t("speaker.quote")}{" "}
                <strong className="text-foreground not-italic">{t("speaker.ecowasStates")}</strong>{" "}
                {t("speaker.ecowasTo")}{" "}
                <strong className="text-foreground not-italic">{t("speaker.ecowasPeople")}</strong>."
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {["6th Legislature", "ECOWAS 2050 Vision", "People-Centred Governance"].map((tag) => (
                <span
                  key={tag}
                  className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default SpeakerSection;
