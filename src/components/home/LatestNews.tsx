import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import newsImg1 from "@/assets/news-1.jpg";
import newsImg2 from "@/assets/news-2.jpg";
import newsImg3 from "@/assets/news-3.jpg";

const placeholderNews = [
  {
    id: "1",
    title: "ECOWAS Parliament Launches Year-Long 25th Anniversary Programme",
    excerpt: "The ECOWAS Parliament celebrates 25 years with a multi-country commemorative programme spanning January to November 2026.",
    date: "2 March 2026",
    category: "Press Release",
    image: newsImg1,
  },
  {
    id: "2",
    title: "Media Announcement Event Set for 5th March in Abuja",
    excerpt: "Dignitaries and media gather at Onomo Allure Abuja for the official media launch of the @25 programme.",
    date: "28 February 2026",
    category: "Event",
    image: newsImg2,
  },
  {
    id: "3",
    title: "Strategic Partnerships Announced for @25 Celebrations",
    excerpt: "AWALCO and institutional sponsors join as partners to support ECOWAS Parliament Initiatives across West Africa.",
    date: "25 February 2026",
    category: "Announcement",
    image: newsImg3,
  },
];

const LatestNews = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <AnimatedSection className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              Latest <span className="text-primary">News</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Stay updated on programme activities</p>
          </div>
          <Button asChild variant="outline" className="mt-4 sm:mt-0">
            <Link to="/news">
              View All News <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderNews.map((article, i) => (
            <AnimatedSection key={article.id} delay={i * 100}>
              <div className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={800}
                    height={800}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
