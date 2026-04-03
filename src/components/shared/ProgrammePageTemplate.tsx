import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { ArrowLeft, MapPin, Target, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  title,
  subtitle,
  description,
  objectives,
  countries,
  accentColor,
  icon,
  mandateLetterUrl,
  children,
}: ProgrammePageTemplateProps) => {
  return (
    <Layout>
      {/* Hero */}
      <section className={`py-20 text-primary-foreground bg-gradient-hero`}>
        <div className="container">
          <AnimatedSection>
            <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-6 -ml-3">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${accentColor}`}>{icon}</div>
              <span className="text-sm uppercase tracking-wider text-primary-foreground/60 font-semibold">Programme Pillar</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black">{title}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{subtitle}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-4xl space-y-12">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6">Objectives</h2>
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
            <h2 className="text-2xl font-bold text-foreground mb-6">Participating Countries</h2>
            <div className="flex flex-wrap gap-3">
              {countries.map((c) => (
                <div key={c} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {c}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Programme Mandate Letter */}
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Programme Mandate
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Document header */}
              <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-card-foreground">Mandate Letter — {title}</p>
                    <p className="text-[11px] text-muted-foreground">Signed by Rt. Hon. Hadja Mémounatou Ibrahima, Speaker of ECOWAS Parliament</p>
                  </div>
                </div>
                {mandateLetterUrl && (
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href={mandateLetterUrl} download>
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </Button>
                )}
              </div>

              {/* Document preview — styled as a formal letter */}
              <div className="p-8 md:p-10">
                <div className="max-w-2xl mx-auto bg-background border border-border rounded-xl p-8 shadow-inner">
                  {/* Letterhead */}
                  <div className="text-center border-b border-border pb-6 mb-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">ECOWAS Parliament</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground/60">Parlement de la CEDEAO</p>
                    <p className="text-lg font-bold text-foreground mt-3">Office of the Speaker</p>
                    <p className="text-xs text-muted-foreground">Herbert Macaulay Way, Central Business District, P.M.B. 576, Abuja, Nigeria</p>
                  </div>

                  {/* Body */}
                  <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground">Programme Mandate: {title}</p>
                    <p>
                      By the authority vested in the Office of the Speaker, ECOWAS Parliament, and in
                      furtherance of the Parliament's mandate of representation of the peoples of West Africa,
                      this mandate letter formally establishes the <strong className="text-foreground">{title}</strong> as
                      an official programme of the ECOWAS Parliament 25th Anniversary celebration.
                    </p>
                    <p>
                      This initiative aligns with the ECOWAS 2050 Vision and the Parliament's commitment to
                      the transition from an ECOWAS of States to an ECOWAS of the People.
                    </p>
                  </div>

                  {/* Signature block */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-end gap-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                        <img src={speakerImg} alt="Speaker" className="w-full h-full object-cover object-top" />
                      </div>
                      <div>
                        <div className="w-32 h-px bg-foreground/30 mb-2" />
                        <p className="text-sm font-bold text-foreground">Rt. Hon. Hadja Mémounatou Ibrahima</p>
                        <p className="text-xs text-muted-foreground">Speaker, ECOWAS Parliament</p>
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
