import { useState, useEffect } from "react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Progress } from "@/components/ui/progress";

const facts = [
  {
    title: "Founded in Abuja",
    text: "The ECOWAS Parliament was established in 2000 and inaugurated in Abuja, Nigeria, as the legislative body of the Economic Community of West African States.",
  },
  {
    title: "115 Parliamentary Seats",
    text: "The Parliament has 115 seats distributed among 12 member states, with Nigeria holding the largest delegation of 35 seats.",
  },
  {
    title: "First Speaker",
    text: "Hon. Ali Nouhoum Diallo of Mali served as the first Speaker of the ECOWAS Parliament, leading its formative years.",
  },
  {
    title: "Observer Status",
    text: "The ECOWAS Parliament holds observer status at the African Union and partners with parliaments across the continent on legislative matters.",
  },
  {
    title: "Parliamentary Diplomacy",
    text: "The Parliament plays a crucial role in conflict resolution, election observation, and fostering democratic governance across West Africa.",
  },
  {
    title: "Multilingual Institution",
    text: "English, French, and Portuguese are the official working languages of the ECOWAS Parliament, reflecting West Africa's linguistic diversity.",
  },
  {
    title: "12 Member States",
    text: "The Parliament represents Benin, Cabo Verde, Côte d'Ivoire, The Gambia, Ghana, Guinea, Guinea-Bissau, Liberia, Nigeria, Senegal, Sierra Leone, and Togo.",
  },
  {
    title: "Advisory to Consultative",
    text: "The Parliament is undergoing transformation from an advisory body to a body with co-decision and legislative powers within the ECOWAS framework.",
  },
];

const INTERVAL = 6000;

const DidYouKnow = () => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / (INTERVAL / 50));
      });
    }, 50);

    const factInterval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % facts.length);
      setProgress(0);
    }, INTERVAL);

    return () => {
      clearInterval(progressInterval);
      clearInterval(factInterval);
    };
  }, []);

  const goTo = (i: number) => { setCurrent(i); setProgress(0); };
  const prev = () => goTo((current - 1 + facts.length) % facts.length);
  const next = () => goTo((current + 1) % facts.length);

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Did You <span className="text-ecowas-yellow">Know?</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Interesting facts about the ECOWAS Parliament
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
              {/* Gradient accent bar */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-ecowas-yellow to-ecowas-lime" />

              <div className="pl-8 pr-6 py-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-ecowas-yellow/10">
                    <Lightbulb className="h-6 w-6 text-ecowas-yellow" />
                  </div>
                  <div className="min-h-[100px]">
                    <h3 className="text-lg font-bold text-card-foreground mb-2">
                      {facts[current].title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {facts[current].text}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Progress value={progress} className="h-1 bg-muted" />
                </div>

                <div className="flex items-center justify-center gap-4 mt-4">
                  <button onClick={prev} className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex gap-2">
                    {facts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          i === current ? "bg-primary scale-125" : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                        }`}
                        aria-label={`Fact ${i + 1}`}
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
