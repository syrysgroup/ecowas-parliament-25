import { Lightbulb } from "lucide-react";
import ProgrammePageTemplate from "@/components/shared/ProgrammePageTemplate";

const Youth = () => (
  <ProgrammePageTemplate
    title="Youth Innovation & Smart Challenge"
    subtitle="Igniting ideas and ambition through national competitions converging in a regional finale."
    description="The ECOWAS Smart Challenge invites young innovators from across the region to participate in national competitions that ignite ideas and ambition. National winners converge in Accra, Ghana for a regional finale showcasing the best of West African youth innovation. This pillar embodies the Parliament's commitment to empowering the next generation of leaders and changemakers."
    objectives={[
      "Launch national Smart Challenge competitions across Member States",
      "Identify and nurture young innovators with solutions for regional challenges",
      "Host a regional finale in Accra bringing together national winners",
      "Create mentorship and networking opportunities for young entrepreneurs",
      "Document youth-driven solutions for regional integration",
    ]}
    countries={["Nigeria", "Ghana", "Côte d'Ivoire", "Senegal", "Cabo Verde", "Togo", "Sierra Leone"]}
    accentColor="bg-ecowas-yellow/20 text-ecowas-yellow"
    icon={<Lightbulb className="h-6 w-6" />}
    heroImage="/announcement/9.jpg"
  />
);

export default Youth;
