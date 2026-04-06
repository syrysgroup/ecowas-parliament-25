import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import newsImg1 from "@/assets/news-1.jpg";

const LatestNews = () => {
  const { t } = useTranslation();

  const { data: articles = [] } = useQuery({
    queryKey: ["homepage-latest-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, status")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <AnimatedSection className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              {t("latestNews.title")} <span className="text-primary">{t("latestNews.titleAccent")}</span>
            </h2>
            <p className="mt-2 text-muted-foreground">{t("latestNews.subtitle")}</p>
          </div>
          <Button asChild variant="outline" className="mt-4 sm:mt-0">
            <Link to="/news">{t("latestNews.viewAll")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </AnimatedSection>

        {articles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">{t("latestNews.noArticles") || "No published articles yet."}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, i) => (
              <AnimatedSection key={article.id} delay={i * 100}>
                <Link to={`/news/${article.slug}`} className="block">
                  <div className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={article.cover_image_url || newsImg1}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={800}
                        height={800}
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-muted-foreground">
                          {article.published_at ? format(parseISO(article.published_at), "d MMMM yyyy") : ""}
                        </span>
                      </div>
                      <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors leading-snug">{article.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestNews;
