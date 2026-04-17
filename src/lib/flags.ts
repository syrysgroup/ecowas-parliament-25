// ─── Local flag fallbacks ──────────────────────────────────────────────────────
// These bundled PNG files are used as fallback when a country's flag_url column
// in the Supabase 'countries' table is not yet populated.
// To remove local imports entirely: upload flag images to Supabase Storage,
// update countries.flag_url for each row, and set each value here to "".
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

/** Synchronous fallback lookup — used when DB flag_url is null */
export const flagMap: Record<string, string> = {
  "Nigeria":       nigeriaFlag,
  "Ghana":         ghanaFlag,
  "Côte d'Ivoire": coteDivoireFlag,
  "Senegal":       senegalFlag,
  "Togo":          togoFlag,
  "Cabo Verde":    caboVerdeFlag,
  "Cape Verde":    caboVerdeFlag,
  "Sierra Leone":  sierraLeoneFlag,
  "Benin":         beninFlag,
  "Gambia":        gambiaFlag,
  "The Gambia":    gambiaFlag,
  "Guinea":        guineaFlag,
  "Guinea-Bissau": guineaBissauFlag,
  "Liberia":       liberiaFlag,
};

/**
 * Returns a flag image src for a given country name.
 * Prefers a Supabase Storage URL (dbUrl) when provided;
 * falls back to the local bundled PNG otherwise.
 */
export const getFlagSrc = (countryName: string, dbUrl?: string | null): string => {
  if (dbUrl && /^https?:\/\//.test(dbUrl)) return dbUrl;
  return flagMap[countryName] ?? "";
};
