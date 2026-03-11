import { Lightbulb, Trophy, Users, Rocket } from "lucide-react";
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
    galleryImages={["/announcement/9.jpg", "/announcement/33.jpg", "/announcement/44.jpg"]}
    highlights={[
      { icon: <Trophy className="h-5 w-5" />, title: "Smart Challenge", description: "National competitions identifying the brightest young innovators." },
      { icon: <Rocket className="h-5 w-5" />, title: "Regional Finale", description: "Winners converge in Accra for the grand showcase." },
      { icon: <Users className="h-5 w-5" />, title: "Mentorship", description: "Connecting youth with experienced mentors and entrepreneurs." },
      { icon: <Lightbulb className="h-5 w-5" />, title: "Innovation Hub", description: "Nurturing solutions for West Africa's regional challenges." },
    ]}
  />
);

export default Youth;
