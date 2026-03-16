import { useState } from "react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const galleryImages = [
  { src: "/announcement/1.jpg", alt: "ECOWAS Parliament @25 Announcement Event" },
  { src: "/announcement/2.jpg", alt: "Dignitaries at the media launch" },
  { src: "/announcement/3.jpg", alt: "Programme presentation" },
  { src: "/announcement/4.png", alt: "Event highlight" },
  { src: "/announcement/5.png", alt: "Stakeholder engagement" },
  { src: "/announcement/7.jpg", alt: "Media briefing" },
  { src: "/announcement/9.jpg", alt: "Panel discussion" },
  { src: "/announcement/11.jpg", alt: "Anniversary celebration" },
  { src: "/announcement/13.jpg", alt: "Partnership signing" },
  { src: "/announcement/15.jpg", alt: "Guest speakers" },
  { src: "/announcement/17.jpg", alt: "Event proceedings" },
  { src: "/announcement/19.jpg", alt: "Programme overview" },
  { src: "/announcement/21.jpg", alt: "Cultural moment" },
  { src: "/announcement/23.jpg", alt: "Dignitaries" },
  { src: "/announcement/25.jpg", alt: "Group photo" },
  { src: "/announcement/27.jpg", alt: "Event attendees" },
];

const AnnouncementGallery = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const navigate = (dir: number) => {
    if (lightbox === null) return;
    const next = (lightbox + dir + galleryImages.length) % galleryImages.length;
    setLightbox(next);
  };

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
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 bg-background/20 hover:bg-background/40 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6 text-background" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="absolute left-4 md:left-8 bg-background/20 hover:bg-background/40 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-background" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            className="absolute right-4 md:right-8 bg-background/20 hover:bg-background/40 rounded-full p-2 transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-background" />
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
