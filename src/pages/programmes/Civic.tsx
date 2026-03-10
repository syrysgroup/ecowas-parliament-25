import { Megaphone } from "lucide-react";
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
  />
);

export default Civic;
