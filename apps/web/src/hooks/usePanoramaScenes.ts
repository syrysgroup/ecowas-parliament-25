import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PanoramaScene } from "@/components/parliament/PanoramaViewer";

export function usePanoramaScenes() {
  return useQuery({
    queryKey: ["panorama-scenes"],
    queryFn: async (): Promise<PanoramaScene[]> => {
      const { data: scenes, error } = await supabase
        .from("parliament_panorama_scenes" as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;

      const { data: hotspots, error: hErr } = await supabase
        .from("parliament_panorama_hotspots" as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (hErr) throw hErr;

      return ((scenes ?? []) as any[]).map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        panorama_url: s.panorama_url,
        mobile_panorama_url: s.mobile_panorama_url ?? null,
        preview_url: s.preview_url ?? null,
        default_yaw: s.default_yaw ?? 0,
        default_pitch: s.default_pitch ?? 0,
        default_zoom: s.default_zoom ?? 50,
        hotspots: ((hotspots ?? []) as any[])
          .filter((h) => h.scene_id === s.id)
          .map((h) => ({
            id: h.id,
            yaw: h.yaw,
            pitch: h.pitch,
            title: h.title,
            description: h.description,
            image_url: h.image_url,
            link_url: h.link_url,
          })),
      }));
    },
  });
}