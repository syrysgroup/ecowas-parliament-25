import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cleanDeep } from "@/lib/text";

export interface PageSectionItem {
  id: string;
  position: number;
  data: Record<string, any>;
  image_url: string | null;
}

export interface PageSection {
  id: string;
  key: string;
  kind: string;
  position: number;
  visible: boolean;
  props: Record<string, any>;
  items: PageSectionItem[];
}

export interface PageRecord {
  id: string;
  slug: string;
  route: string;
  title: string;
  description: string | null;
  status: string;
  seo: Record<string, any>;
  og_image: string | null;
  sections: PageSection[];
}

/** Fetch one page with all sections + items, cleaned and sorted. */
export function usePage(slug: string) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async (): Promise<PageRecord | null> => {
      const { data: page } = await supabase
        .from("pages")
        .select("id, slug, route, title, description, status, seo, og_image")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!page) return null;
      const { data: sections } = await supabase
        .from("page_sections")
        .select("id, key, kind, position, visible, props")
        .eq("page_id", page.id)
        .eq("visible", true)
        .order("position");
      const sectionIds = (sections ?? []).map((s) => s.id);
      const { data: items } = sectionIds.length
        ? await supabase
            .from("page_section_items")
            .select("id, section_id, position, data, image_url")
            .in("section_id", sectionIds)
            .order("position")
        : { data: [] as any[] };
      const itemsBySection = new Map<string, PageSectionItem[]>();
      for (const it of items ?? []) {
        const arr = itemsBySection.get(it.section_id) ?? [];
        arr.push({
          id: it.id,
          position: it.position,
          data: cleanDeep(it.data ?? {}),
          image_url: it.image_url,
        });
        itemsBySection.set(it.section_id, arr);
      }
      return cleanDeep({
        id: page.id,
        slug: page.slug,
        route: page.route,
        title: page.title,
        description: page.description,
        status: page.status,
        seo: page.seo ?? {},
        og_image: page.og_image,
        sections: (sections ?? []).map((s) => ({
          ...s,
          props: s.props ?? {},
          items: itemsBySection.get(s.id) ?? [],
        })),
      }) as PageRecord;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Lookup a section by key inside a page result. */
export function findSection(page: PageRecord | null | undefined, key: string): PageSection | undefined {
  return page?.sections.find((s) => s.key === key);
}