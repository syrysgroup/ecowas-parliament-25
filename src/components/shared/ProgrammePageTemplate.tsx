import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Highlight {
  icon: ReactNode;
  title: string;
  description: string;
}

interface ProgrammePageTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  countries: string[];
  accentColor: string;
  icon: ReactNode;
  heroImage?: string;
  highlights?: Highlight[];
  galleryImages?: string[];
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
  highlights,
  galleryImages,
  children,
}: ProgrammePageTemplateProps) => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32 text-primary-foreground bg-gradient-hero overflow-hidden">
        {heroImage && (
          <>
            <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url('${heroImage}')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-primary/40" />
          </>
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
            <h1 className="text-4xl md:text-6xl font-black">{title}</h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">{subtitle}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Photo Strip */}
      {galleryImages && galleryImages.length > 0 && (
        <section className="py-0 -mt-8 relative z-10">
          <div className="container">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {galleryImages.map((src, i) => (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className="overflow-hidden rounded-xl border border-border shadow-lg aspect-[4/3]">
                    <img src={src} alt={`Programme highlight ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-5xl space-y-16">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{description}</p>
          </AnimatedSection>

          {/* Key Highlights */}
          {highlights && highlights.length > 0 && (
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-6">Key Highlights</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {highlights.map((h, i) => (
                  <div key={i} className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className={`inline-flex p-2.5 rounded-lg ${accentColor} mb-3`}>
                      {h.icon}
                    </div>
                    <h3 className="font-bold text-card-foreground mb-1">{h.title}</h3>
                    <p className="text-sm text-muted-foreground">{h.description}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Objectives - numbered cards */}
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6">Objectives</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {objectives.map((obj, i) => (
                <div key={i} className="flex gap-4 items-start p-4 rounded-xl bg-muted/50 border border-border">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground text-sm pt-1">{obj}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Countries */}
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-6">Participating Countries</h2>
            <div className="flex flex-wrap gap-3">
              {countries.map((c) => (
                <div key={c} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-sm text-sm font-medium text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {c}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {children}

          {/* CTA */}
          <AnimatedSection>
            <div className="p-8 rounded-2xl bg-muted/50 border border-border text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Explore More Programmes</h3>
              <p className="text-muted-foreground mb-6">Discover other pillars of the ECOWAS Parliament @25 programme.</p>
              <Button asChild size="lg" className="font-semibold">
                <Link to="/#pillars">View All Pillars</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default ProgrammePageTemplate;
