import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { ArrowLeft, MapPin, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgrammePageTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  countries: string[];
  accentColor: string;
  icon: ReactNode;
  heroImage?: string;
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
  heroImage,
  children,
}: ProgrammePageTemplateProps) => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 text-primary-foreground bg-gradient-hero overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url('${heroImage}')` }} />
        )}
        <div className="container relative">
          <AnimatedSection>
            <Button asChild variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-6 -ml-3 font-semibold">
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

          {children}
        </div>
      </section>
    </Layout>
  );
};

export default ProgrammePageTemplate;
