import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Strip a single pair of surrounding quote characters that may exist from
 *  legacy double-JSON-encoded JSONB string values in `site_settings.value`. */
function stripWrappingQuotes(s: string): string {
  if (s.length >= 2) {
    const first = s[0];
    const last = s[s.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return s.slice(1, -1);
    }
  }
  return s;
}

export function useSiteSettings() {
  const { data: settings = {} } = useQuery<Record<string, string>>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value");
      const map: Record<string, string> = {};
      (data ?? []).forEach((row: { key: string; value: any }) => {
        const raw = typeof row.value === "string" ? row.value : JSON.stringify(row.value);
        map[row.key] = stripWrappingQuotes(raw);
      });
      return map;
    },
    staleTime: 30 * 1000,
  });

  const get = (key: string, fallback = "") => settings[key] || fallback;

  return { settings, get };
}
