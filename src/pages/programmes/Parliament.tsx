import { Building2, Users, FileText, Award } from "lucide-react";
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
    galleryImages={["/announcement/15.jpg", "/announcement/31.jpg", "/announcement/50.jpg"]}
    highlights={[
      { icon: <Building2 className="h-5 w-5" />, title: "Simulated Parliament", description: "Youth experience real parliamentary debate and procedure." },
      { icon: <Users className="h-5 w-5" />, title: "Youth Parliament Vision", description: "Launching the pathway to an institutional ECOWAS Youth Parliament." },
      { icon: <FileText className="h-5 w-5" />, title: "Youth Reports", description: "Documenting proceedings and recommendations from young delegates." },
      { icon: <Award className="h-5 w-5" />, title: "Civic Leadership", description: "Building parliamentary skills for the next generation." },
    ]}
  />
);

export default Parliament;
