import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProgrammeVisibilityResult {
  isLoading: boolean;
  isVisible: boolean;
}

export function useProgrammeVisibility(slug: string): ProgrammeVisibilityResult {
  const { data, isLoading } = useQuery({
    queryKey: ["programme-visibility", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programme_pillars")
        .select("id")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 60_000,
  });

  return {
    isLoading,
    isVisible: !!data,
  };
}
