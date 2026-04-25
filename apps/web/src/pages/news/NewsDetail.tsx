import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Share2, Copy, CheckCircle2, Mail, Clock, MapPin, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "@/components/ui/sonner";
import newsImg1 from "@/assets/news-1.jpg";

interface ExternalLink { title: string; url: string; publication?: string; }

function truncate(str: string | null | undefined, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

function readingTime(html: string | null | undefined): number {
  const words = html?.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length ?? 0;
  return Math.max(1, Math.ceil(words / 200));
}

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
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <p className="text-5xl mb-6">📰</p>
          <h1 className="text-2xl font-black text-foreground mb-3">Article not found</h1>
          <p className="text-muted-foreground mb-8">This article may have been removed or the link is incorrect.</p>
          <Button asChild variant="outline">
            <Link to="/news"><ArrowLeft className="mr-2 h-4 w-4" /> Back to News</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const a = article as any;
  const externalLinks: ExternalLink[] = (() => {
    try {
      const links = a.external_links;
      return Array.isArray(links) ? links : [];
    } catch { return []; }
  })();

  const mins = readingTime(article.content);
  const sidebarNews = moreNews.slice(0, 4);
  const gridNews = moreNews.slice(0, 3);
  const heroImage = article.cover_image_url || newsImg1;

  return (
    <Layout>
      {/* ── Hero ── */}
      <header className="relative min-h-[55vh] md:min-h-[65vh] flex flex-col justify-end overflow-hidden">
        {/* Background image */}
        <img
          src={heroImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay — dark at bottom, lighter at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        {/* Back link */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 backdrop-blur-sm border border-white/10">
            <Link to="/news"><ArrowLeft className="h-4 w-4" /> News</Link>
          </Button>
        </div>

        {/* Hero text */}
        <div className="relative z-10 container pb-10 md:pb-14 pt-20">
          <AnimatedSection>
            {/* Category */}
            {a.category && (
              <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded mb-4">
                {a.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight max-w-4xl">
              {article.title}
            </h1>

            {/* Deck */}
            {a.deck && (
              <p className="mt-4 text-lg md:text-xl text-white/75 max-w-3xl leading-relaxed font-light">
                {a.deck}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-sm text-white/60">
              {a.author_name && (
                <span className="flex items-center gap-1.5 text-white/80 font-semibold">
                  <User className="h-3.5 w-3.5" /> {a.author_name}
                </span>
              )}
              {a.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {a.location}
                </span>
              )}
              {article.published_at && (
                <span>{format(parseISO(article.published_at), "d MMMM yyyy")}</span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {mins} min read
              </span>
            </div>
          </AnimatedSection>
        </div>
      </header>

      {/* Image caption */}
      {a.image_caption && (
        <div className="container">
          <p className="text-xs text-muted-foreground italic py-2 border-b border-border">{a.image_caption}</p>
        </div>
      )}

      {/* ── Body ── */}
      <article className="py-10 md:py-14">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_360px] gap-12 xl:gap-16">

            {/* Main column */}
            <div className="min-w-0 space-y-8">

              {/* Excerpt as lead when no deck */}
              {!a.deck && article.excerpt && (
                <AnimatedSection>
                  <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium border-l-4 border-primary pl-5">
                    {article.excerpt}
                  </p>
                </AnimatedSection>
              )}

              {/* Article body */}
              {article.content && (
                <AnimatedSection>
                  <div
                    className="prose prose-neutral dark:prose-invert max-w-none
                      prose-p:leading-relaxed prose-p:text-base
                      prose-headings:font-bold prose-headings:text-foreground
                      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                      prose-h3:text-xl prose-h3:mt-8
                      prose-blockquote:border-l-primary prose-blockquote:italic prose-blockquote:text-muted-foreground
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-xl prose-img:shadow-md
                      prose-hr:border-border"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </AnimatedSection>
              )}

              {/* External Media Links */}
              {externalLinks.length > 0 && (
                <AnimatedSection>
                  <div className="pt-8 border-t border-border">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-primary" /> Media Coverage
                    </h2>
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                      {externalLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start gap-3 px-5 py-4 bg-card hover:bg-muted/50 transition-colors group"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
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

              {/* Mobile share strip */}
              <AnimatedSection>
                <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-border lg:hidden">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">Share:</span>
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">𝕏</a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Facebook</a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={handleCopyLink}>
                    {copied ? <><CheckCircle2 className="h-3 w-3 text-green-500" />Copied!</> : <><Copy className="h-3 w-3" />Copy link</>}
                  </Button>
                </div>
              </AnimatedSection>
            </div>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-5">

                {/* Share */}
                <AnimatedSection>
                  <Card className="border-border">
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-primary" /> Share this article
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">𝕏 Twitter</a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Facebook</a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                          <a href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 w-full justify-center" onClick={handleCopyLink}>
                          {copied ? <><CheckCircle2 className="h-3 w-3 text-green-500" />Copied!</> : <><Copy className="h-3 w-3" />Copy link</>}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* Newsletter */}
                <AnimatedSection delay={80}>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" /> Stay Updated
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">Get the latest EP25 news delivered to your inbox.</p>
                      <form onSubmit={handleSubscribe} className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="h-8 text-xs"
                          required
                        />
                        <Button type="submit" size="sm" className="h-8 text-xs w-full">Subscribe</Button>
                      </form>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* More news list */}
                {sidebarNews.length > 0 && (
                  <AnimatedSection delay={160}>
                    <Card className="border-border">
                      <CardContent className="p-5 space-y-4">
                        <h3 className="font-bold text-sm text-card-foreground">More News</h3>
                        <div className="space-y-4">
                          {sidebarNews.map(item => (
                            <Link key={item.id} to={`/news/${item.slug}`} className="flex gap-3 group">
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                <img
                                  src={item.cover_image_url || newsImg1}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-xs font-semibold text-card-foreground group-hover:text-primary transition-colors leading-snug">
                                  {truncate(item.title, 72)}
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
                        <Button asChild variant="ghost" size="sm" className="w-full text-xs h-8 text-primary hover:text-primary">
                          <Link to="/news">View all news →</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                )}
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ── More News grid ── */}
      {gridNews.length > 0 && (
        <section className="py-16 border-t border-border bg-muted/20">
          <div className="container">
            <AnimatedSection className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">More from EP25</h2>
              <Button asChild variant="ghost" size="sm" className="text-primary text-sm">
                <Link to="/news">All News →</Link>
              </Button>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridNews.map((item, i) => (
                <AnimatedSection key={item.id} delay={i * 80}>
                  <Link to={`/news/${item.slug}`} className="group block h-full">
                    <div className="h-full rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      <div className="aspect-[16/9] overflow-hidden bg-muted">
                        <img
                          src={item.cover_image_url || newsImg1}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        {item.published_at && (
                          <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                            {format(parseISO(item.published_at), "d MMMM yyyy")}
                          </p>
                        )}
                        <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors leading-snug text-[15px] mb-2">
                          {truncate(item.title, 80)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                          {truncate(item.excerpt, 130)}
                        </p>
                        <p className="text-xs text-primary font-semibold mt-3 group-hover:gap-1.5 transition-all">
                          Read article →
                        </p>
                      </div>
                    </div>
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
