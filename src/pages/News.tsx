import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Filter } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import newsImg1 from "@/assets/news-1.jpg";

const News = () => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: articles = [] } = useQuery({
    queryKey: ["news-page-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, status")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">{t("news.heroTitle")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("news.heroDesc")}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {articles.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No published articles yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, i) => (
                <AnimatedSection key={article.id} delay={i * 80}>
                  <Link to={`/news/${article.slug}`} className="block">
                    <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="aspect-[4/5] overflow-hidden">
                        <img
                          src={article.cover_image_url || newsImg1}
                          alt={article.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          width={1080}
                          height={1350}
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
    </Layout>
  );
};

export default News;
