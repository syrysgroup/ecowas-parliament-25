import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/NotFound";

interface PillarRow {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  emoji: string | null;
  color: string | null;
  progress_percent: number;
  lead_name: string | null;
  is_active: boolean;
}

interface PageContent {
  page_title: string | null;
  tagline: string | null;
  description: string | null;
  hero_image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
}

interface SectionRow {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  display_order: number;
}

export default function PillarPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: pillar, isLoading: pillarLoading } = useQuery<PillarRow | null>({
    queryKey: ["pillar-detail-web", slug],
    queryFn: async () => {
      const { data } = await (supabase.from("programme_pillars" as any) as any)
        .select("id,slug,title,description,emoji,color,progress_percent,lead_name,is_active")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      return data ?? null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const { data: pageContent } = useQuery<PageContent | null>({
    queryKey: ["pillar-page-content-web", slug],
    queryFn: async () => {
      const { data } = await (supabase.from("pillar_page_content" as any) as any)
        .select("page_title,tagline,description,hero_image_url,cta_label,cta_url")
        .eq("pillar_slug", slug)
        .maybeSingle();
      return data ?? null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sections = [] } = useQuery<SectionRow[]>({
    queryKey: ["pillar-sections-web", slug],
    queryFn: async () => {
      const { data } = await (supabase.from("pillar_sections" as any) as any)
        .select("id,title,content,image_url,display_order")
        .eq("pillar_slug", slug)
        .eq("is_visible", true)
        .order("display_order");
      return data ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  if (pillarLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!pillar) {
    return <NotFound />;
  }

  const displayTitle = pageContent?.page_title || pillar.title || slug;
  const displayTagline = pageContent?.tagline;
  const displayDesc = pageContent?.description || pillar.description;
  const accentColor = pillar.color ?? "hsl(152 100% 26%)";

  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={
          pageContent?.hero_image_url
            ? { backgroundImage: `url(${pageContent.hero_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(135deg, ${accentColor}22 0%, transparent 60%)` }
        }
      >
        {/* Overlay for image heroes */}
        {pageContent?.hero_image_url && (
          <div className="absolute inset-0 bg-black/50" />
        )}

        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
          {pillar.emoji && (
            <div className="text-5xl mb-4">{pillar.emoji}</div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {displayTitle}
          </h1>
          {displayTagline && (
            <p className="text-xl md:text-2xl font-medium mb-4" style={{ color: accentColor }}>
              {displayTagline}
            </p>
          )}
          {displayDesc && (
            <p className="text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed">
              {displayDesc}
            </p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            {pageContent?.cta_label && pageContent?.cta_url && (
              <a
                href={pageContent.cta_url}
                className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                {pageContent.cta_label}
              </a>
            )}
            {pillar.lead_name && (
              <span className="text-sm text-muted-foreground">
                Lead: <span className="font-medium text-foreground">{pillar.lead_name}</span>
              </span>
            )}
            {pillar.progress_percent > 0 && (
              <span className="text-sm text-muted-foreground">
                Progress: <span className="font-medium" style={{ color: accentColor }}>{pillar.progress_percent}%</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {sections.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
          {sections.map((s, idx) => (
            <section key={s.id} className={`flex flex-col ${s.image_url && idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-10 items-start`}>
              {s.image_url && (
                <div className="w-full md:w-2/5 flex-shrink-0">
                  <img
                    src={s.image_url}
                    alt={s.title}
                    className="w-full rounded-2xl object-cover aspect-video"
                  />
                </div>
              )}
              <div className={s.image_url ? "flex-1" : "w-full"}>
                <div className="h-1 w-12 rounded-full mb-4" style={{ backgroundColor: accentColor }} />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{s.title}</h2>
                {s.content && (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{s.content}</p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Empty state when no page content has been authored yet */}
      {sections.length === 0 && !pageContent?.description && (
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-muted-foreground text-lg">
            Detailed content for this programme is coming soon.
          </p>
        </div>
      )}
    </Layout>
  );
}
