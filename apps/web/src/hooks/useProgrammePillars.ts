import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProgrammePillarNav {
  id: string;
  slug: string;
  title: string;
  route: string;
  display_order: number;
}

export function useProgrammePillars() {
  return useQuery({
    queryKey: ["programme_pillars", "nav"],
    queryFn: async (): Promise<ProgrammePillarNav[]> => {
      const { data, error } = await supabase
        .from("programme_pillars" as any)
        .select("id,slug,title,route,display_order")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return ((data as any[]) ?? []).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title ?? p.slug,
        route: p.route ?? `/programmes/${p.slug}`,
        display_order: p.display_order ?? 0,
      }));
    },
    staleTime: 60_000,
  });
}
