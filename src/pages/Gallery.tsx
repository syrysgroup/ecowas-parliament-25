import { useState } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Category = "All" | "Dignitaries & Leadership" | "Media Briefing" | "Panel Discussions" | "Cultural Moments" | "Group Photos" | "Event Highlights";

const categories: Category[] = [
  "All",
  "Dignitaries & Leadership",
  "Media Briefing",
  "Panel Discussions",
  "Cultural Moments",
  "Group Photos",
  "Event Highlights",
];

interface GalleryImage {
  src: string;
  alt: string;
  category: Category;
}

const galleryImages: GalleryImage[] = [
  // Dignitaries & Leadership
  { src: "/announcement/1.jpg", alt: "Rt. Hon. Speaker at the launch event", category: "Dignitaries & Leadership" },
  { src: "/announcement/2.jpg", alt: "Dignitaries arriving at the venue", category: "Dignitaries & Leadership" },
  { src: "/announcement/13.jpg", alt: "Partnership signing ceremony", category: "Dignitaries & Leadership" },
  { src: "/announcement/15.jpg", alt: "Guest speakers on stage", category: "Dignitaries & Leadership" },
  { src: "/announcement/23.jpg", alt: "Distinguished guests", category: "Dignitaries & Leadership" },
  { src: "/announcement/31.jpg", alt: "Leadership panel", category: "Dignitaries & Leadership" },
  { src: "/announcement/33.jpg", alt: "VIP attendees", category: "Dignitaries & Leadership" },
  { src: "/announcement/39.jpg", alt: "Opening remarks by Speaker", category: "Dignitaries & Leadership" },

  // Media Briefing
  { src: "/announcement/3.jpg", alt: "Programme presentation to media", category: "Media Briefing" },
  { src: "/announcement/7.jpg", alt: "Press conference", category: "Media Briefing" },
  { src: "/announcement/9.jpg", alt: "Media panel discussion", category: "Media Briefing" },
  { src: "/announcement/17.jpg", alt: "Event proceedings coverage", category: "Media Briefing" },
  { src: "/announcement/35.jpg", alt: "Journalist Q&A session", category: "Media Briefing" },
  { src: "/announcement/37.jpg", alt: "Media engagement moment", category: "Media Briefing" },
  { src: "/announcement/44.jpg", alt: "Press briefing setup", category: "Media Briefing" },
  { src: "/announcement/46.jpg", alt: "Media team at work", category: "Media Briefing" },

  // Panel Discussions
  { src: "/announcement/4.png", alt: "Panel on regional integration", category: "Panel Discussions" },
  { src: "/announcement/11.jpg", alt: "Anniversary celebration panel", category: "Panel Discussions" },
  { src: "/announcement/19.jpg", alt: "Programme overview discussion", category: "Panel Discussions" },
  { src: "/announcement/27.jpg", alt: "Stakeholder roundtable", category: "Panel Discussions" },
  { src: "/announcement/29.png", alt: "Policy discussion panel", category: "Panel Discussions" },
  { src: "/announcement/40.jpg", alt: "Expert panel session", category: "Panel Discussions" },
  { src: "/announcement/42.jpg", alt: "Interactive discussion forum", category: "Panel Discussions" },

  // Cultural Moments
  { src: "/announcement/5.png", alt: "Cultural performance", category: "Cultural Moments" },
  { src: "/announcement/21.jpg", alt: "Cultural moment at the ceremony", category: "Cultural Moments" },
  { src: "/announcement/30.jpg", alt: "Traditional welcome ceremony", category: "Cultural Moments" },
  { src: "/announcement/36.png", alt: "Cultural display", category: "Cultural Moments" },
  { src: "/announcement/43.png", alt: "Heritage showcase", category: "Cultural Moments" },
  { src: "/announcement/48.jpg", alt: "Artistic performance", category: "Cultural Moments" },
  { src: "/announcement/49.jpg", alt: "Cultural celebration", category: "Cultural Moments" },

  // Group Photos
  { src: "/announcement/25.jpg", alt: "Group photo of delegates", category: "Group Photos" },
  { src: "/announcement/28.jpg", alt: "Team photo at the event", category: "Group Photos" },
  { src: "/announcement/50.jpg", alt: "Final group photograph", category: "Group Photos" },
  { src: "/announcement/47.png", alt: "Organizing committee group photo", category: "Group Photos" },
  { src: "/announcement/45.png", alt: "Partner organizations group shot", category: "Group Photos" },

  // Event Highlights
  { src: "/announcement/6.png", alt: "Event highlight moment", category: "Event Highlights" },
  { src: "/announcement/8.png", alt: "Venue setup", category: "Event Highlights" },
  { src: "/announcement/10.png", alt: "Audience engagement", category: "Event Highlights" },
  { src: "/announcement/12.png", alt: "Event proceedings", category: "Event Highlights" },
  { src: "/announcement/14.png", alt: "Award presentation", category: "Event Highlights" },
  { src: "/announcement/16.png", alt: "Programme milestone", category: "Event Highlights" },
  { src: "/announcement/18.png", alt: "Special announcement", category: "Event Highlights" },
  { src: "/announcement/20.png", alt: "Closing highlights", category: "Event Highlights" },
  { src: "/announcement/22.png", alt: "Behind the scenes", category: "Event Highlights" },
  { src: "/announcement/24.png", alt: "Reception event", category: "Event Highlights" },
  { src: "/announcement/26.png", alt: "Networking session", category: "Event Highlights" },
  { src: "/announcement/32.png", alt: "Presentation moment", category: "Event Highlights" },
  { src: "/announcement/34.png", alt: "Interactive session", category: "Event Highlights" },
  { src: "/announcement/38.png", alt: "Programme branding", category: "Event Highlights" },
  { src: "/announcement/41.png", alt: "Delegate registration", category: "Event Highlights" },
];

const Gallery = () => {
  const [selected, setSelected] = useState<Category>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = selected === "All" ? galleryImages : galleryImages.filter((img) => img.category === selected);

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const prevImage = () => setLightbox((prev) => (prev !== null && prev > 0 ? prev - 1 : filtered.length - 1));
  const nextImage = () => setLightbox((prev) => (prev !== null && prev < filtered.length - 1 ? prev + 1 : 0));

  return (
    <Layout>
      <section className="relative bg-gradient-hero text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/announcement/25.jpg')" }} />
        <div className="container relative">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">Photo Gallery</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              Browse highlights from the official media announcement of the ECOWAS Parliament @25 programme.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={`px-4 py-2 text-sm rounded-full border font-semibold transition-all ${
                  selected === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:shadow-md"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-6">{filtered.length} photos</p>

          {/* Gallery grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((img, i) => (
              <AnimatedSection key={img.src} delay={i * 30}>
                <button
                  onClick={() => openLightbox(i)}
                  className="w-full overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring break-inside-avoid block"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                  />
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-background hover:text-accent transition-colors z-10"
          >
            <X className="h-8 w-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 md:left-8 text-background hover:text-accent transition-colors z-10"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 md:right-8 text-background hover:text-accent transition-colors z-10"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
          <img
            src={filtered[lightbox].src}
            alt={filtered[lightbox].alt}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-background/80 text-sm">{filtered[lightbox].alt}</p>
            <p className="text-background/50 text-xs mt-1">{lightbox + 1} / {filtered.length}</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Gallery;
