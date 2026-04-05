import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { ArrowLeft, MapPin, Target, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import speakerImg from "@/assets/speaker-memounatou.jpeg";

interface ProgrammePageTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  countries: string[];
  accentColor: string;
  icon: ReactNode;
  mandateLetterUrl?: string;
  children?: ReactNode;
}

const ProgrammePageTemplate = ({
  title, subtitle, description, objectives, countries, accentColor, icon, mandateLetterUrl, children,
}: ProgrammePageTemplateProps) => {
  const { t } = useTranslation();

  return (
    <Layout>
      <section className={`py-20 text-primary-foreground bg-gradient-hero`}>
        <div className="container">
          <AnimatedSection>
            <Button asChild variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 mb-6 -ml-3">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.backToHome")}</Link>
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${accentColor}`}>{icon}</div>
              <span className="text-sm uppercase tracking-wider text-primary-foreground/60 font-semibold">{t("common.programmePillar")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black">{title}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{subtitle}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl space-y-12">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t("common.overview")}</h2>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6">{t("common.objectives")}</h2>
            <div className="space-y-3">
              {objectives.map((obj, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{obj}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6">{t("common.participatingCountries")}</h2>
            <div className="flex flex-wrap gap-3">
              {countries.map((c) => (
                <div key={c} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />{c}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />{t("common.programmeMandate")}
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg"><FileText className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-bold text-card-foreground">{t("common.mandateLetter", { title })}</p>
                    <p className="text-[11px] text-muted-foreground">{t("common.mandateSignedBy")}</p>
                  </div>
                </div>
                {mandateLetterUrl && (
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href={mandateLetterUrl} download><Download className="h-3.5 w-3.5" />{t("common.download")}</a>
                  </Button>
                )}
              </div>
              <div className="p-8 md:p-10">
                <div className="max-w-2xl mx-auto bg-background border border-border rounded-xl p-8 shadow-inner">
                  <div className="text-center border-b border-border pb-6 mb-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t("common.ecowasParliament")}</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground/60">{t("common.parlementCedeao")}</p>
                    <p className="text-lg font-bold text-foreground mt-3">{t("common.officeOfSpeaker")}</p>
                    <p className="text-xs text-muted-foreground">{t("common.addressLine")}</p>
                  </div>
                  <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground">{t("common.programmeMandate2", { title })}</p>
                    <p>{t("common.mandateBody1", { title })}</p>
                    <p>{t("common.mandateBody2")}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-end gap-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                        <img src={speakerImg} alt={t("common.speakerName")} className="w-full h-full object-cover object-top" />
                      </div>
                      <div>
                        <div className="w-32 h-px bg-foreground/30 mb-2" />
                        <p className="text-sm font-bold text-foreground">{t("common.speakerName")}</p>
                        <p className="text-xs text-muted-foreground">{t("common.speakerRole")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {children}
        </div>
      </section>
    </Layout>
  );
};

export default ProgrammePageTemplate;
