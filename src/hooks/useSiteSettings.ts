import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings() {
  const { data: settings = {} } = useQuery<Record<string, string>>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("site_settings")
        .select("key, value");
      const map: Record<string, string> = {};
      (data ?? []).forEach((row: { key: string; value: any }) => {
        map[row.key] = typeof row.value === "string" ? row.value : JSON.stringify(row.value);
      });
      return map;
    },
    staleTime: 2 * 60 * 1000,
  });

  const get = (key: string, fallback = "") => settings[key] || fallback;

  return { settings, get };
}
