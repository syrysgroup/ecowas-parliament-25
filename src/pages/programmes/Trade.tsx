import { TrendingUp } from "lucide-react";
import ProgrammePageTemplate from "@/components/shared/ProgrammePageTemplate";

const Trade = () => (
  <ProgrammePageTemplate
    title="Trade & SME Forums"
    subtitle="Working platforms where regional trade becomes practical, inclusive, and bankable."
    description="Entrepreneurs gather in cities across the region — Abidjan, Accra, Lomé, Freetown, Lagos — connecting through B2B forums, pilot trade corridors, and dialogue with policymakers. These are not symbolic meetings; they are working platforms where regional trade becomes practical, inclusive, and bankable. The forums bring together SMEs, trade facilitators, and government officials to advance cross-border commerce."
    objectives={[
      "Organise B2B trade forums in five West African cities",
      "Establish pilot trade corridors for cross-border SME activity",
      "Facilitate dialogue between entrepreneurs and policymakers",
      "Promote women-led and youth-led enterprises in regional trade",
      "Document trade facilitation outcomes and recommendations",
    ]}
    countries={["Côte d'Ivoire", "Ghana", "Togo", "Sierra Leone", "Nigeria"]}
    accentColor="bg-primary/20 text-primary"
    icon={<TrendingUp className="h-6 w-6" />}
    heroImage="/announcement/11.jpg"
  />
);

export default Trade;
