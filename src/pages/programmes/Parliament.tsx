import { Building2 } from "lucide-react";
import ProgrammePageTemplate from "@/components/shared/ProgrammePageTemplate";

const Parliament = () => (
  <ProgrammePageTemplate
    title="Simulated Youth Parliament"
    subtitle="Giving young people a seat at the table — launching the ECOWAS Youth Parliament vision."
    description="In May, the story reaches the parliamentary chamber itself. A Simulated ECOWAS Parliament gives young people a seat at the table, launching the Rt. Hon. Speaker's vision of a future ECOWAS Youth Parliament. What begins as simulation becomes aspiration, documented through youth reports in Abidjan and carried forward to Abuja. This initiative represents a cornerstone of the Parliament's commitment to intergenerational leadership."
    objectives={[
      "Organise a Simulated ECOWAS Parliament session for young people",
      "Launch the Rt. Hon. Speaker's vision of a future ECOWAS Youth Parliament",
      "Document proceedings through youth reports and publications",
      "Build parliamentary skills and civic knowledge among young participants",
      "Create a pathway from simulation to institutional youth engagement",
    ]}
    countries={["Côte d'Ivoire", "Nigeria"]}
    accentColor="bg-ecowas-red/20 text-ecowas-red"
    icon={<Building2 className="h-6 w-6" />}
    heroImage="/announcement/15.jpg"
  />
);

export default Parliament;
