import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ClipboardList, UserPlus, Vote, Megaphone, Building2 } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Nominations Open",
    description: "Each ECOWAS member state opens nominations for youth representatives aged 18–35.",
    date: "March 2026",
    status: "active" as const,
  },
  {
    icon: UserPlus,
    title: "Youth Apply",
    description: "Young citizens submit applications with their vision for regional governance and development.",
    date: "April 2026",
    status: "upcoming" as const,
  },
  {
    icon: Vote,
    title: "Selection & Voting",
    description: "A transparent selection process through national committees and public voting determines delegates.",
    date: "April–May 2026",
    status: "upcoming" as const,
  },
  {
    icon: Megaphone,
    title: "Delegates Announced",
    description: "Selected youth honourable members are publicly announced and prepared for the parliamentary session.",
    date: "May 2026",
    status: "upcoming" as const,
  },
  {
    icon: Building2,
    title: "Simulated Parliament",
    description: "Delegates convene in Abidjan for a full simulated ECOWAS Parliament session with real parliamentary procedures.",
    date: "May 2026",
    status: "upcoming" as const,
  },
];

const NominationTimeline = () => {
  return (
    <div className="space-y-10">
      <AnimatedSection className="text-center">
        <h3 className="text-2xl md:text-3xl font-black text-foreground">
          Nomination & Voting Process
        </h3>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          A transparent, five-step process to select youth honourable members from across West Africa.
        </p>
      </AnimatedSection>

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px" />

        {steps.map((step, i) => {
          const Icon = step.icon;
          const isLeft = i % 2 === 0;
          return (
            <AnimatedSection key={step.title} delay={i * 100}>
              <div className={`relative flex items-start gap-4 mb-10 md:mb-14 ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              }`}>
                {/* Connector dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10 mt-6" />

                {/* Content */}
                <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                  isLeft ? "md:pr-8 md:text-right" : "md:pl-8"
                }`}>
                  <div className={`inline-flex items-center gap-2 mb-2 ${
                    isLeft ? "md:flex-row-reverse" : ""
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      step.status === "active"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      step.status === "active" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {step.date}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-foreground">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
            </AnimatedSection>
          );
        })}
      </div>

      <AnimatedSection className="text-center">
        <Button size="lg" className="text-base px-8">
          Apply as Youth Representative
        </Button>
      </AnimatedSection>
    </div>
  );
};

export default NominationTimeline;
