import { Heart, Users, ShoppingBag, Handshake, GraduationCap } from "lucide-react";
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
    heroImage="/announcement/13.jpg"
    galleryImages={["/announcement/13.jpg", "/announcement/30.jpg", "/announcement/42.jpg"]}
    highlights={[
      { icon: <ShoppingBag className="h-5 w-5" />, title: "Trade Platforms", description: "Dedicated marketplaces connecting women entrepreneurs across borders." },
      { icon: <GraduationCap className="h-5 w-5" />, title: "Capacity Building", description: "Workshops and training for women-led SMEs in the region." },
      { icon: <Users className="h-5 w-5" />, title: "Networking", description: "Cross-border networking events building lasting business relationships." },
      { icon: <Handshake className="h-5 w-5" />, title: "Policy Advocacy", description: "Championing policies that support women's economic participation." },
    ]}
  />
);

export default Women;
