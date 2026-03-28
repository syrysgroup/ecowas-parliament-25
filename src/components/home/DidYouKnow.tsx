import { useState, useEffect } from "react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";

const facts = [
  {
    title: "Founded in 2000",
    text: "The ECOWAS Parliament was inaugurated on 27 November 2000 in Abuja, Nigeria, as the legislative arm of the Economic Community of West African States.",
  },
  {
    title: "115 Seats",
    text: "The Parliament comprises 115 seats distributed among 12 member states, with Nigeria holding 35 seats as the largest delegation.",
  },
  {
    title: "First Speaker",
    text: "Hon. Ali Nouhoum Diallo of Mali served as the first Speaker of the ECOWAS Parliament, laying the groundwork for regional parliamentary diplomacy.",
  },
  {
    title: "Parliamentary Diplomacy",
    text: "The ECOWAS Parliament engages in conflict prevention, mediation, and election observation across West Africa as part of its mandate.",
  },
  {
    title: "Advisory to Consultative",
    text: "The Parliament is undergoing transformation from an advisory body to a body with co-decision and legislative powers within the ECOWAS framework.",
  },
  {
    title: "12 Member States",
    text: "The Parliament represents Benin, Cabo Verde, Côte d'Ivoire, The Gambia, Ghana, Guinea, Guinea-Bissau, Liberia, Nigeria, Senegal, Sierra Leone, and Togo.",
  },
  {
    title: "Youth Engagement",
    text: "The ECOWAS Parliament actively promotes youth participation in governance through programmes like the Youth Parliament initiative.",
  },
  {
    title: "Multilingual Institution",
    text: "The Parliament operates in three official languages: English, French, and Portuguese, reflecting the linguistic diversity of West Africa.",
  },
];

const DidYouKnow = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % facts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + facts.length) % facts.length);
  const next = () => setCurrent((c) => (c + 1) % facts.length);

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container">
        <AnimatedSection className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Lightbulb className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Did You Know?</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground">
            Facts About the <span className="text-primary">ECOWAS Parliament</span>
          </h2>
        </AnimatedSection>

        <div className="max-w-2xl mx-auto">
          <div className="relative bg-card rounded-2xl border border-border shadow-lg p-8 md:p-10 min-h-[180px] flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-primary mb-3">{facts[current].title}</h3>
            <p className="text-muted-foreground leading-relaxed">{facts[current].text}</p>

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={prev}
                className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5">
                {facts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === current ? "bg-primary w-5" : "bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DidYouKnow;
