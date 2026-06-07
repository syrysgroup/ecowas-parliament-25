import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Loader2 } from "lucide-react";

const TITLES: Record<string, string> = {
  privacy: "Privacy Policy",
  terms:   "Terms of Use",
  cookies: "Cookie Policy",
};

interface LegalPageProps { pageKey?: string }

export default function LegalPage({ pageKey: propKey }: LegalPageProps) {
  const params = useParams<{ pageKey?: string }>();
  const pageKey = propKey ?? params.pageKey ?? "privacy";

  const { data, isLoading } = useQuery({
    queryKey: ["legal-page", pageKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("legal_page_versions")
        .select("html, title, version, created_at")
        .eq("page_key", pageKey)
        .eq("is_published", true)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  return (
    <Layout>
      <section className="bg-muted/30 border-b border-border py-16">
        <div className="container">
          <AnimatedSection>
            <h1 className="text-3xl md:text-4xl font-black">{data?.title ?? TITLES[pageKey] ?? "Legal"}</h1>
            {data?.created_at && (
              <p className="text-sm text-muted-foreground mt-2">
                Last updated {new Date(data.created_at).toLocaleDateString()}
              </p>
            )}
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : data?.html ? (
            <article className="prose prose-sm md:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: data.html }} />
          ) : (
            <p className="text-muted-foreground">This page has not yet been published.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
