import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .single();
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-black text-foreground mb-4">Article not found</h1>
          <Button asChild variant="outline">
            <Link to="/news"><ArrowLeft className="mr-2 h-4 w-4" /> Back to News</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Parse external_links from the article
  const externalLinks: { title: string; url: string }[] = (() => {
    try {
      const links = (article as any).external_links;
      if (Array.isArray(links)) return links;
      return [];
    } catch { return []; }
  })();

  return (
    <Layout>
      <article className="py-12">
        <div className="container max-w-3xl">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link to="/news"><ArrowLeft className="mr-2 h-4 w-4" /> Back to News</Link>
          </Button>

          {article.cover_image_url && (
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full max-h-[600px] object-cover rounded-2xl mb-8"
            />
          )}

          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">{article.title}</h1>

          {article.published_at && (
            <p className="text-sm text-muted-foreground mb-8">
              {format(parseISO(article.published_at), "d MMMM yyyy")}
            </p>
          )}

          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed border-l-4 border-primary pl-4">
              {article.excerpt}
            </p>
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {article.content?.split("\n").map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* External Media Links */}
          {externalLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" /> Related Media Coverage
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {externalLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all group"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-card-foreground group-hover:text-primary line-clamp-2">
                      {link.title || link.url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
};

export default NewsDetail;
