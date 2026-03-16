import { useState } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const galleryImages = [
  { src: "/announcement/1.jpg", alt: "Rt. Hon. Speaker at the launch", category: "Dignitaries" },
  { src: "/announcement/3.jpg", alt: "Programme presentation to media", category: "Media" },
  { src: "/announcement/5.png", alt: "Cultural performance", category: "Cultural" },
  { src: "/announcement/7.jpg", alt: "Press conference", category: "Media" },
  { src: "/announcement/9.jpg", alt: "Panel discussion", category: "Panel" },
  { src: "/announcement/11.jpg", alt: "Anniversary panel", category: "Panel" },
  { src: "/announcement/13.jpg", alt: "Partnership signing", category: "Dignitaries" },
  { src: "/announcement/15.jpg", alt: "Guest speakers", category: "Dignitaries" },
  { src: "/announcement/21.jpg", alt: "Cultural moment", category: "Cultural" },
  { src: "/announcement/25.jpg", alt: "Group photo", category: "Group" },
  { src: "/announcement/27.jpg", alt: "Event attendees", category: "Highlights" },
  { src: "/announcement/19.jpg", alt: "Programme overview", category: "Panel" },
];

const AnnouncementGallery = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Media <span className="text-primary">Announcement</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Highlights from the official media announcement of the ECOWAS Parliament @25 programme.
          </p>
        </AnimatedSection>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {galleryImages.map((img, i) => (
            <AnimatedSection key={i} delay={i * 50}>
              <button
                onClick={() => setLightbox(i)}
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

        <AnimatedSection className="text-center mt-10">
          <Button asChild size="lg" className="font-bold shadow-lg">
            <Link to="/gallery">
              View Full Gallery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AnimatedSection>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-background hover:text-accent transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={galleryImages[lightbox].src}
            alt={galleryImages[lightbox].alt}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default AnnouncementGallery;
