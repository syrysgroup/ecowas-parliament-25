import AnimatedSection from "@/components/shared/AnimatedSection";
import { Quote } from "lucide-react";

const QuoteStrip = () => {
  return (
    <section className="relative py-20 bg-gradient-hero text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 bg-ecowas-yellow/5" />
      <div className="container relative">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <Quote className="h-10 w-10 text-ecowas-yellow mx-auto mb-6 opacity-60" />
          <blockquote className="text-xl md:text-2xl font-semibold leading-relaxed italic text-primary-foreground/90">
            "This anniversary marks a renewal of our commitment to citizens, regional unity,
            and a more integrated and prosperous West Africa."
          </blockquote>
          <div className="mt-8">
            <p className="font-bold text-ecowas-yellow">Rt. Hon. Hadja Mémounatou Ibrahima</p>
            <p className="text-sm text-primary-foreground/60 mt-1">Speaker, ECOWAS Parliament</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default QuoteStrip;
