import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import newsImg1 from "@/assets/news-1.jpg";

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
              className="w-full aspect-video object-cover rounded-2xl mb-8"
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
            {article.content?.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default NewsDetail;
