import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Share2, Copy, CheckCircle2, Mail } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "@/components/ui/sonner";
import newsImg1 from "@/assets/news-1.jpg";

interface ExternalLink { title: string; url: string; publication?: string; }

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");

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

  const { data: moreNews = [] } = useQuery({
    queryKey: ["more-news", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at")
        .eq("status", "published")
        .neq("slug", slug!)
        .order("published_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
    enabled: !!slug,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await supabase.from("newsletter_subscribers").insert({ email });
    toast("Subscribed! You'll receive our latest updates.");
    setEmail("");
  };

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

  const externalLinks: ExternalLink[] = (() => {
    try {
      const links = (article as any).external_links;
      if (Array.isArray(links)) return links;
      return [];
    } catch { return []; }
  })();

  const a = article as any;
  const sidebarNews = moreNews.slice(0, 4);
  const gridNews = moreNews.slice(0, 3);

  return (
    <Layout>
      {/* Hero cover */}
      <section className="bg-muted/30">
        <div className="container py-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/news"><ArrowLeft className="mr-2 h-4 w-4" /> Back to News</Link>
          </Button>
          {/* Category / section tag */}
          {a.category && (
            <span className="inline-block bg-primary/10 text-primary text-[11px] font-medium tracking-widest uppercase px-3 py-1 rounded-sm">
              {a.category}
            </span>
          )}
        </div>
      </section>

      <article className="py-10">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            {/* Main content */}
            <div className="space-y-8 min-w-0">

              {/* Cover image */}
              {article.cover_image_url && (
                <AnimatedSection>
                  <div className="aspect-[16/7] overflow-hidden rounded-2xl shadow-lg">
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  {/* Image caption */}
                  {a.image_caption && (
                    <p className="text-xs text-muted-foreground italic mt-2 pl-1">{a.image_caption}</p>
                  )}
                </AnimatedSection>
              )}

              {/* Title */}
              <AnimatedSection>
                <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">{article.title}</h1>
              </AnimatedSection>

              {/* Deck / standfirst */}
              {a.deck && (
                <AnimatedSection>
                  <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 italic font-light">
                    {a.deck}
                  </p>
                </AnimatedSection>
              )}

              {/* Meta row: author · location · date */}
              <AnimatedSection>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground border-t border-b border-border py-3">
                  {a.author_name && (
                    <span className="text-primary font-semibold uppercase tracking-widest text-xs">
                      {a.author_name}
                    </span>
                  )}
                  {a.location && (
                    <span>{a.location}</span>
                  )}
                  {article.published_at && (
                    <span>{format(parseISO(article.published_at), "d MMMM yyyy")}</span>
                  )}
                </div>
              </AnimatedSection>

              {/* Fallback: excerpt as lead if no deck */}
              {!a.deck && article.excerpt && (
                <AnimatedSection>
                  <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4">
                    {article.excerpt}
                  </p>
                </AnimatedSection>
              )}

              {/* Article body — rendered as HTML from TipTap */}
              {article.content && (
                <AnimatedSection>
                  <div
                    className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-primary prose-blockquote:border-l-primary prose-blockquote:italic"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </AnimatedSection>
              )}

              {/* External Media Links */}
              {externalLinks.length > 0 && (
                <AnimatedSection>
                  <div className="pt-8 border-t border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" /> Media Coverage
                    </h2>
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                      {externalLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 px-5 py-4 bg-card hover:bg-muted/50 transition-colors group"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {link.title || link.url}
                            </span>
                            {link.publication && (
                              <span className="block text-xs text-muted-foreground italic mt-0.5">— {link.publication}</span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Share */}
                <AnimatedSection>
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                        <Share2 className="h-4 w-4" /> Share this article
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">𝕏 Twitter</a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Facebook</a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                          <a href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleCopyLink}>
                          {copied ? <><CheckCircle2 className="h-3 w-3" />Copied!</> : <><Copy className="h-3 w-3" />Copy Link</>}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* Newsletter CTA */}
                <AnimatedSection delay={100}>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Stay Updated
                      </h3>
                      <p className="text-xs text-muted-foreground">Get the latest news delivered to your inbox.</p>
                      <form onSubmit={handleSubscribe} className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Your email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="h-8 text-xs"
                          required
                        />
                        <Button type="submit" size="sm" className="h-8 text-xs px-3">Subscribe</Button>
                      </form>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* More News sidebar list */}
                {sidebarNews.length > 0 && (
                  <AnimatedSection delay={200}>
                    <Card>
                      <CardContent className="p-5 space-y-4">
                        <h3 className="font-bold text-sm text-card-foreground">More News</h3>
                        <div className="space-y-3">
                          {sidebarNews.map(item => (
                            <Link key={item.id} to={`/news/${item.slug}`} className="flex gap-3 group">
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.cover_image_url || newsImg1}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                  {item.title}
                                </p>
                                {item.published_at && (
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {format(parseISO(item.published_at), "d MMM yyyy")}
                                  </p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                )}
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* More News grid */}
      {gridNews.length > 0 && (
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="container">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-8">More News</h2>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridNews.map((item, i) => (
                <AnimatedSection key={item.id} delay={i * 80}>
                  <Link to={`/news/${item.slug}`} className="block">
                    <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="aspect-[4/5] overflow-hidden">
                        <img
                          src={item.cover_image_url || newsImg1}
                          alt={item.title}
                          className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-5">
                        {item.published_at && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {format(parseISO(item.published_at), "d MMMM yyyy")}
                          </p>
                        )}
                        <h3 className="font-bold text-card-foreground leading-snug line-clamp-2">{item.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default NewsDetail;
