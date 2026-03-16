import { Megaphone, Tv, Bus, Smartphone } from "lucide-react";
import ProgrammePageTemplate from "@/components/shared/ProgrammePageTemplate";

const Civic = () => (
  <ProgrammePageTemplate
    title="Civic Education & Awareness"
    subtitle="The ECOWAS Caravan and TV Game Show — bringing Parliament closer to citizens."
    description="The ECOWAS Caravan moves through communities — airports, schools, buses, digital platforms — bringing the Parliament closer to citizens. Messages of regional unity and civic responsibility travel where people live and work, turning awareness into ownership. The programme culminates with the ECOWAS TV Game Show, blending learning with entertainment and building civic knowledge across the airwaves."
    objectives={[
      "Deploy the ECOWAS Caravan across communities in multiple Member States",
      "Reach citizens through airports, schools, buses, and digital platforms",
      "Promote messages of regional unity and civic responsibility",
      "Launch the ECOWAS TV Game Show for civic education through entertainment",
      "Build public understanding of the ECOWAS Parliament's role and impact",
    ]}
    countries={["Nigeria", "Ghana", "Côte d'Ivoire", "Senegal", "Cabo Verde", "Togo", "Sierra Leone"]}
    accentColor="bg-ecowas-blue/20 text-ecowas-blue"
    icon={<Megaphone className="h-6 w-6" />}
    heroImage="/announcement/17.jpg"
    galleryImages={["/announcement/17.jpg", "/announcement/37.jpg", "/announcement/48.jpg"]}
    highlights={[
      { icon: <Bus className="h-5 w-5" />, title: "ECOWAS Caravan", description: "Mobile awareness campaign reaching communities across West Africa." },
      { icon: <Tv className="h-5 w-5" />, title: "TV Game Show", description: "Entertaining civic education broadcast across the region." },
      { icon: <Smartphone className="h-5 w-5" />, title: "Digital Outreach", description: "Social media and digital platforms amplifying the message." },
      { icon: <Megaphone className="h-5 w-5" />, title: "Community Engagement", description: "Direct outreach in schools, airports, and public spaces." },
    ]}
  />
);

export default Civic;
