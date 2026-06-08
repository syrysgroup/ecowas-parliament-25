import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cleanDeep } from "@/lib/text";

export function useSiteContent(sectionKey: string) {
  return useQuery({
    queryKey: ["site-content", sectionKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", sectionKey)
        .maybeSingle();
      const raw = (data?.content as Record<string, string>) ?? null;
      return raw ? cleanDeep(raw) : null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
