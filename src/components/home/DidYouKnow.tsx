import { useState, useEffect } from "react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/i18n";

const INTERVAL = 6000;

const DidYouKnow = () => {
  const { t } = useTranslation();
  const facts = [
    { title: t("dyk.fact1.title"), text: t("dyk.fact1.text") },
    { title: t("dyk.fact2.title"), text: t("dyk.fact2.text") },
    { title: t("dyk.fact3.title"), text: t("dyk.fact3.text") },
    { title: t("dyk.fact4.title"), text: t("dyk.fact4.text") },
    { title: t("dyk.fact5.title"), text: t("dyk.fact5.text") },
    { title: t("dyk.fact6.title"), text: t("dyk.fact6.text") },
    { title: t("dyk.fact7.title"), text: t("dyk.fact7.text") },
    { title: t("dyk.fact8.title"), text: t("dyk.fact8.text") },
  ];

  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => prev >= 100 ? 100 : prev + (100 / (INTERVAL / 50)));
    }, 50);
    const factInterval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % facts.length);
      setProgress(0);
    }, INTERVAL);
    return () => { clearInterval(progressInterval); clearInterval(factInterval); };
  }, [facts.length]);

  const goTo = (i: number) => { setCurrent(i); setProgress(0); };
  const prev = () => goTo((current - 1 + facts.length) % facts.length);
  const next = () => goTo((current + 1) % facts.length);

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("dyk.title")} <span className="text-ecowas-yellow">{t("dyk.titleAccent")}</span>
          </h2>
          <p className="mt-3 text-muted-foreground">{t("dyk.subtitle")}</p>
        </AnimatedSection>
        <AnimatedSection>
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-ecowas-yellow to-ecowas-lime" />
              <div className="pl-8 pr-6 py-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-ecowas-yellow/10">
                    <Lightbulb className="h-6 w-6 text-ecowas-yellow" />
                  </div>
                  <div className="min-h-[100px]">
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{facts[current].title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{facts[current].text}</p>
                  </div>
                </div>
                <div className="mt-6"><Progress value={progress} className="h-1 bg-muted" /></div>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button onClick={prev} className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex gap-2">
                    {facts.map((_, i) => (
                      <button key={i} onClick={() => goTo(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? "bg-primary scale-125" : "bg-muted-foreground/20 hover:bg-muted-foreground/40"}`}
                        aria-label={t("dyk.factAriaLabel", { num: String(i + 1) })}
                      />
                    ))}
                  </div>
                  <button onClick={next} className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default DidYouKnow;
