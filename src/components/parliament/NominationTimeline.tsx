import AnimatedSection from "@/components/shared/AnimatedSection";
import { ClipboardList, Users, Vote, Megaphone, Building2 } from "lucide-react";

const steps = [
  { icon: <ClipboardList className="h-5 w-5" />, title: "Country Nominations Open", description: "Each member state opens nominations for youth representatives." },
  { icon: <Users className="h-5 w-5" />, title: "Youth Apply / Get Nominated", description: "Young people aged 18–35 apply directly or get nominated — nominees need at least 200 nominations to qualify." },
  { icon: <Vote className="h-5 w-5" />, title: "Voting & Selection Process", description: "Transparent selection process within each national delegation." },
  { icon: <Megaphone className="h-5 w-5" />, title: "Delegates Announced", description: "Final delegate lists published and onboarding begins." },
  { icon: <Building2 className="h-5 w-5" />, title: "Simulated Parliament Session", description: "Delegates convene for the historic ECOWAS Youth Parliament simulation." },
];

const NominationTimeline = () => {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <AnimatedSection key={i} delay={i * 80}>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                {step.icon}
              </div>
              {i < steps.length - 1 && (
                <div className="w-0.5 h-full min-h-[40px] bg-border" />
              )}
            </div>
            <div className="pb-8">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Step {i + 1}</p>
              <h4 className="font-bold text-foreground">{step.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
            </div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
};

export default NominationTimeline;
