import { useState, lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, MapPin, Maximize2, ExternalLink, Compass } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { usePanoramaScenes } from "@/hooks/usePanoramaScenes";
import type { PanoramaHotspot } from "@/components/parliament/PanoramaViewer";

const PanoramaViewer = lazy(() => import("@/components/parliament/PanoramaViewer"));

export default function ParliamentTour() {
  const { data: scenes, isLoading } = usePanoramaScenes();
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<PanoramaHotspot | null>(null);

  const scene = scenes?.find((s) => s.id === activeSceneId) ?? scenes?.[0];

  useEffect(() => {
    if (!scene?.panorama_url) return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const href =
      isMobile && scene.panorama_url.endsWith("chamber-main.jpg")
        ? scene.panorama_url.replace("chamber-main.jpg", "chamber-main-mobile.jpg")
        : scene.panorama_url;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    (link as any).fetchPriority = "high";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [scene?.panorama_url]);

  return (
    <Layout>
      <SEOHead
        title="Virtual 360° Tour — ECOWAS Parliament Chamber"
        description="Step inside the ECOWAS Parliament chamber in Abuja. An immersive 360° walkthrough with interactive hotspots highlighting the Speaker's chair, member benches, and public gallery."
      />

      <section className="bg-gradient-to-b from-ecowas-green/5 to-background border-b border-border">
        <div className="container py-8 md:py-12">
          <Button asChild variant="ghost" size="sm" className="mb-4 gap-1">
            <Link to="/ecowas-parliament"><ArrowLeft className="h-4 w-4" /> Back to Parliament</Link>
          </Button>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge className="bg-ecowas-yellow/20 text-ecowas-yellow-foreground border-ecowas-yellow/40 mb-3">
                Virtual Experience
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black text-foreground">Step Inside the Chamber</h1>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Explore the ECOWAS Parliament hall in immersive 360°. Drag to look around, click hotspots
                for details, or tap fullscreen for a cinematic experience.
              </p>
            </div>
            {scenes && scenes.length > 1 && (
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a panorama scene">
                {scenes.map((s) => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={s.id === scene?.id ? "default" : "outline"}
                    onClick={() => setActiveSceneId(s.id)}
                    role="tab"
                    aria-selected={s.id === scene?.id}
                    aria-label={`Switch to ${s.name} panorama`}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-black">
        <div className="relative w-full" style={{ height: "min(80vh, 720px)" }}>
          {isLoading || !scene ? (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Loader2 className="h-8 w-8 animate-spin text-ecowas-yellow" />
            </div>
          ) : (
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-ecowas-yellow" />
              </div>
            }>
              <PanoramaViewer
                scene={scene}
                autoRotate
                onHotspotClick={setActiveHotspot}
              />
            </Suspense>
          )}
        </div>
      </section>

      {scene && scene.hotspots.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 id="poi-heading" className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" /> Points of Interest
            </h2>
            <ul
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0"
              aria-labelledby="poi-heading"
            >
              {scene.hotspots.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(h)}
                    aria-label={`Open details for ${h.title}`}
                    className="w-full text-left p-5 rounded-xl bg-card border border-border hover:shadow-lg hover:border-primary/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <h3 className="font-bold text-card-foreground mb-1.5">{h.title}</h3>
                    {h.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{h.description}</p>
                    )}
                    <p className="text-xs text-primary font-medium mt-3 inline-flex items-center gap-1">
                      <Maximize2 className="h-3 w-3" aria-hidden="true" /> View in tour
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Dialog open={!!activeHotspot} onOpenChange={(o) => !o && setActiveHotspot(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden gap-0">
          {activeHotspot?.image_url ? (
            <div className="relative w-full aspect-[16/9] bg-muted">
              <img
                src={activeHotspot.image_url}
                alt={activeHotspot.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <Badge className="bg-ecowas-yellow/90 text-ecowas-green-foreground border-0 mb-2">
                  <MapPin className="h-3 w-3 mr-1" /> {scene?.name ?? "Point of Interest"}
                </Badge>
                <h2 className="text-2xl font-black leading-tight drop-shadow">
                  {activeHotspot.title}
                </h2>
              </div>
            </div>
          ) : (
            <div className="px-6 pt-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">
                <MapPin className="h-3 w-3 mr-1" /> {scene?.name ?? "Point of Interest"}
              </Badge>
            </div>
          )}

          <div className="p-6 space-y-4">
            <DialogHeader className="space-y-2 text-left">
              {!activeHotspot?.image_url && (
                <DialogTitle className="text-2xl">{activeHotspot?.title}</DialogTitle>
              )}
              {activeHotspot?.description ? (
                <DialogDescription className="text-base text-foreground/80 leading-relaxed">
                  {activeHotspot.description}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  Details about {activeHotspot?.title}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setActiveHotspot(null)}
              >
                <Compass className="h-4 w-4" /> Back to tour
              </Button>
              {activeHotspot?.link_url && (
                <Button asChild className="flex-1 gap-2">
                  <a href={activeHotspot.link_url} target="_blank" rel="noopener noreferrer">
                    Learn more <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}