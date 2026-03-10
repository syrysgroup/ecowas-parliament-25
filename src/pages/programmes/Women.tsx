import { Heart } from "lucide-react";
import ProgrammePageTemplate from "@/components/shared/ProgrammePageTemplate";

const Women = () => (
  <ProgrammePageTemplate
    title="Women's Economic Empowerment"
    subtitle="Women-focused trade and entrepreneurship platforms driving inclusive growth."
    description="This pillar centres women as key drivers of regional economic growth and integration. Through dedicated trade platforms, entrepreneurship workshops, and networking opportunities, the programme creates spaces where women entrepreneurs can connect, learn, and grow their businesses across borders. The initiative aligns with the Parliament's commitment to gender inclusion and women's economic participation."
    objectives={[
      "Create dedicated women-focused trade and entrepreneurship platforms",
      "Support women entrepreneurs in accessing cross-border markets",
      "Host capacity-building workshops for women-led SMEs",
      "Build networks of women entrepreneurs across ECOWAS Member States",
      "Advocate for policies supporting women's economic empowerment",
    ]}
    countries={["Nigeria", "Ghana", "Côte d'Ivoire", "Senegal", "Togo", "Sierra Leone"]}
    accentColor="bg-secondary/20 text-secondary"
    icon={<Heart className="h-6 w-6" />}
  />
);

export default Women;
