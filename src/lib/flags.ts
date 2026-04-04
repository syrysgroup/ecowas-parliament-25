import beninFlag from "@/assets/flags/benin.png";
import caboVerdeFlag from "@/assets/flags/cabo-verde.png";
import coteDivoireFlag from "@/assets/flags/cote-divoire.png";
import gambiaFlag from "@/assets/flags/gambia.png";
import ghanaFlag from "@/assets/flags/ghana.png";
import guineaBissauFlag from "@/assets/flags/guinea-bissau.png";
import guineaFlag from "@/assets/flags/guinea.png";
import liberiaFlag from "@/assets/flags/liberia.png";
import nigeriaFlag from "@/assets/flags/nigeria.png";
import senegalFlag from "@/assets/flags/senegal.png";
import sierraLeoneFlag from "@/assets/flags/sierra-leone.png";
import togoFlag from "@/assets/flags/togo.png";

export const flagMap: Record<string, string> = {
  "Nigeria": nigeriaFlag,
  "Ghana": ghanaFlag,
  "Côte d'Ivoire": coteDivoireFlag,
  "Senegal": senegalFlag,
  "Togo": togoFlag,
  "Cabo Verde": caboVerdeFlag,
  "Cape Verde": caboVerdeFlag,
  "Sierra Leone": sierraLeoneFlag,
  "Benin": beninFlag,
  "Gambia": gambiaFlag,
  "The Gambia": gambiaFlag,
  "Guinea": guineaFlag,
  "Guinea-Bissau": guineaBissauFlag,
  "Liberia": liberiaFlag,
};

export const getFlagSrc = (countryName: string): string => {
  return flagMap[countryName] || "";
};
