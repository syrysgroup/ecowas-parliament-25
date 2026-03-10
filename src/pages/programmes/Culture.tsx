import { Palette } from "lucide-react";
import ProgrammePageTemplate from "@/components/shared/ProgrammePageTemplate";

const Culture = () => (
  <ProgrammePageTemplate
    title="Cultural & Creative Celebrations"
    subtitle="Fashion, film, food, literature, music, art, and sport celebrating West African diversity."
    description="Culture gives the anniversary its rhythm. From fashion and film to food and literature, creative festivals celebrate the diversity that binds West Africa together. Music, art, and sport become a shared language, culminating in a regional cultural showcase during the final celebrations. This pillar honours the rich creative heritage of the ECOWAS region while fostering cross-cultural dialogue and appreciation."
    objectives={[
      "Organise cultural festivals showcasing West African creative industries",
      "Celebrate fashion, film, food, literature, music, art, and sport",
      "Foster cross-cultural dialogue and appreciation across Member States",
      "Support creative entrepreneurs and artists from the region",
      "Culminate in a regional cultural showcase at the grand finale",
    ]}
    countries={["Cabo Verde", "Nigeria", "Ghana", "Côte d'Ivoire", "Senegal"]}
    accentColor="bg-ecowas-lime/20 text-ecowas-lime"
    icon={<Palette className="h-6 w-6" />}
    heroImage="/announcement/21.jpg"
  />
);

export default Culture;
