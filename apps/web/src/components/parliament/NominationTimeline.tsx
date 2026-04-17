import AnimatedSection from "@/components/shared/AnimatedSection";
import { ClipboardList, ShieldCheck, Users, Vote, Megaphone } from "lucide-react";

const steps = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: "Applications and nominations open",
    description: "Young people can either apply directly or nominate a public profile from their country delegation.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Public nominee profiles go live",
    description: "Approved nominees appear with portraits, bios, and country placement so communities can identify their voices.",
  },
  {
    icon: <Vote className="h-5 w-5" />,
    title: "Live voting leaderboard",
    description: "Supporters cast one vote per approved nominee and track momentum in real time by country.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Moderators verify delegates",
    description: "Admins and moderators review submissions, approve finalists, and publish the accepted representatives.",
  },
  {
    icon: <Megaphone className="h-5 w-5" />,
    title: "Delegates represent their people",
    description: "The final public roster introduces each verified delegate with a portrait, short bio, and mandate summary.",
  },
];

const NominationTimeline = () => {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <AnimatedSection key={step.title} delay={index * 80}>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                {step.icon}
              </div>
              {index < steps.length - 1 && <div className="min-h-[44px] w-0.5 bg-border" />}
            </div>
            <div className="pb-8">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step {index + 1}</p>
              <h4 className="font-black text-foreground">{step.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
};

export default NominationTimeline;
