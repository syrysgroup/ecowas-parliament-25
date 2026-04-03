import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Filter } from "lucide-react";
import { useState } from "react";
import newsImg1 from "@/assets/news-1.jpg";
import newsImg2 from "@/assets/news-2.jpg";
import newsImg3 from "@/assets/news-3.jpg";
import newsImg4 from "@/assets/news-4.jpg";
import newsImg5 from "@/assets/news-5.jpg";
import newsImg6 from "@/assets/news-6.jpg";

const categories = ["All", "Press Release", "Event", "Announcement", "Update"];

const allNews = [
  { id: "1", title: "ECOWAS Parliament Launches Year-Long 25th Anniversary Programme", excerpt: "The ECOWAS Parliament celebrates 25 years with a multi-country commemorative programme spanning January to November 2026.", date: "2 March 2026", category: "Press Release", image: newsImg1 },
  { id: "2", title: "Media Announcement Event Set for 5th March in Abuja", excerpt: "Dignitaries and media gather at Onomo Allure Abuja for the official media launch of the @25 programme.", date: "28 February 2026", category: "Event", image: newsImg2 },
  { id: "3", title: "Strategic Partnerships Announced for @25 Celebrations", excerpt: "Duchess NL, CMD Tourism & Trade, and Borderless Trade & Investment join as implementing partners.", date: "25 February 2026", category: "Announcement", image: newsImg3 },
  { id: "4", title: "ECOWAS Smart Challenge Opens Registration", excerpt: "Young innovators across the region invited to participate in national competitions leading to a regional finale in Accra.", date: "15 February 2026", category: "Update", image: newsImg4 },
  { id: "5", title: "Simulated Youth Parliament Dates Confirmed", excerpt: "The Rt. Hon. Speaker's initiative to give young people a seat at the table will take place in May 2026 in Abidjan.", date: "10 February 2026", category: "Event", image: newsImg5 },
  { id: "6", title: "ECOWAS Caravan Route Announced", excerpt: "The civic education caravan will visit airports, schools, and communities across multiple Member States.", date: "5 February 2026", category: "Announcement", image: newsImg6 },
];

const News = () => {
  const [selected, setSelected] = useState("All");
  const filtered = selected === "All" ? allNews : allNews.filter((n) => n.category === selected);

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">News & Updates</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              Latest news and announcements from the ECOWAS Parliament @25 programme.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  selected === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => (
              <AnimatedSection key={article.id} delay={i * 80}>
                <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
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
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
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
    </Layout>
  );
};

export default News;
