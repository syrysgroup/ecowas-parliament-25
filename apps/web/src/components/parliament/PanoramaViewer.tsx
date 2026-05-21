import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import { Loader2 } from "lucide-react";

export type PanoramaHotspot = {
  id: string;
  yaw: number;
  pitch: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  link_url?: string | null;
};

export type PanoramaScene = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  panorama_url: string;
  mobile_panorama_url?: string | null;
  preview_url?: string | null;
  default_yaw: number;
  default_pitch: number;
  default_zoom?: number | null;
  hotspots: PanoramaHotspot[];
};

interface Props {
  scene: PanoramaScene;
  autoRotate?: boolean;
  className?: string;
  onHotspotClick?: (hotspot: PanoramaHotspot) => void;
}

/**
 * Full-featured 360° equirectangular panorama viewer.
 * - Drag / pinch / wheel to look around
 * - Hotspot markers with click popovers
 * - Fullscreen + VR + autorotate toolbar buttons (built into PSV)
 * - Gyroscope on mobile (opt-in via toolbar)
 */
export default function PanoramaViewer({ scene, autoRotate = true, className, onHotspotClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusedHotspotIdx, setFocusedHotspotIdx] = useState<number>(-1);
  const [announcement, setAnnouncement] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)").matches;

    const panoramaUrl =
      isMobile && scene.mobile_panorama_url
        ? scene.mobile_panorama_url
        : isMobile && scene.panorama_url.endsWith("chamber-main.jpg")
        ? scene.panorama_url.replace("chamber-main.jpg", "chamber-main-mobile.jpg")
        : scene.panorama_url;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: panoramaUrl,
      defaultYaw: scene.default_yaw,
      defaultPitch: scene.default_pitch,
      defaultZoomLvl: typeof scene.default_zoom === "number" ? scene.default_zoom : 50,
      navbar: ["zoom", "move", "autorotate", "gyroscope", "fullscreen"],
      loadingTxt: "Loading the Parliament chamber…",
      touchmoveTwoFingers: false,
      mousewheelCtrlKey: false,
      plugins: [
        MarkersPlugin,
        [AutorotatePlugin, {
          autostartDelay: 2000,
          autorotatePitch: 0,
          autorotateSpeed: "0.3rpm",
        }],
        GyroscopePlugin,
      ],
    });

    viewerRef.current = viewer;

    viewer.addEventListener("ready", () => {
      setLoading(false);
      const markersPlugin = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
      if (markersPlugin && scene.hotspots.length) {
        markersPlugin.setMarkers(
          scene.hotspots.map((h) => ({
            id: h.id,
            position: { yaw: h.yaw, pitch: h.pitch },
            html: `<div class="psv-hotspot-dot" role="button" tabindex="0" aria-label="Hotspot: ${h.title.replace(/"/g, "&quot;")}. Press Enter to view details."></div>`,
            anchor: "center center",
            tooltip: { content: h.title, position: "top center" },
            data: h,
          }))
        );
        markersPlugin.addEventListener("select-marker", ({ marker }) => {
          const hotspot = marker.config.data as PanoramaHotspot;
          if (onHotspotClick) onHotspotClick(hotspot);
        });
      }

      if (autoRotate && !prefersReducedMotion) {
        const autoPlugin = viewer.getPlugin<AutorotatePlugin>(AutorotatePlugin);
        autoPlugin?.start();
      }
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  // Keyboard navigation: arrows pan, +/- zoom, H cycles hotspots, Enter activates focused hotspot
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const PAN = Math.PI / 36; // ~5°
    const pos = viewer.getPosition();
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        viewer.rotate({ yaw: pos.yaw - PAN, pitch: pos.pitch });
        break;
      case "ArrowRight":
        e.preventDefault();
        viewer.rotate({ yaw: pos.yaw + PAN, pitch: pos.pitch });
        break;
      case "ArrowUp":
        e.preventDefault();
        viewer.rotate({ yaw: pos.yaw, pitch: pos.pitch + PAN });
        break;
      case "ArrowDown":
        e.preventDefault();
        viewer.rotate({ yaw: pos.yaw, pitch: pos.pitch - PAN });
        break;
      case "+":
      case "=":
        e.preventDefault();
        viewer.zoomIn(10);
        break;
      case "-":
      case "_":
        e.preventDefault();
        viewer.zoomOut(10);
        break;
      case "h":
      case "H": {
        e.preventDefault();
        if (!scene.hotspots.length) return;
        const next = (focusedHotspotIdx + 1) % scene.hotspots.length;
        setFocusedHotspotIdx(next);
        const h = scene.hotspots[next];
        viewer.animate({ yaw: h.yaw, pitch: h.pitch, speed: "3rpm" });
        setAnnouncement(`Hotspot ${next + 1} of ${scene.hotspots.length}: ${h.title}. Press Enter to open.`);
        break;
      }
      case "Enter":
      case " ":
        {
          // If a marker dot has DOM focus, activate that one
          const target = e.target as HTMLElement;
          const dot = target?.closest?.(".psv-hotspot-dot") as HTMLElement | null;
          if (dot) {
            e.preventDefault();
            // Find marker id by walking up to the PSV marker wrapper
            const wrapper = dot.closest("[data-psv-marker]") as HTMLElement | null;
            const id = wrapper?.getAttribute("data-psv-marker");
            const h = scene.hotspots.find((x) => x.id === id);
            if (h) onHotspotClick?.(h);
            return;
          }
        }
        if (focusedHotspotIdx >= 0 && focusedHotspotIdx < scene.hotspots.length) {
          e.preventDefault();
          onHotspotClick?.(scene.hotspots[focusedHotspotIdx]);
        }
        break;
      case "Home":
        e.preventDefault();
        viewer.animate({ yaw: scene.default_yaw, pitch: scene.default_pitch, speed: "3rpm" });
        setAnnouncement("View reset to starting position.");
        break;
    }
  };

  return (
    <div
      className={`relative w-full h-full bg-black ${className ?? ""}`}
      role="region"
      aria-label={`Interactive 360° panorama: ${scene.name}. Use arrow keys to look around, plus and minus to zoom, H to cycle hotspots, Enter to open the focused hotspot, Home to reset view.`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 bg-center bg-cover focus:outline-none focus-visible:ring-4 focus-visible:ring-ecowas-yellow/70 focus-visible:ring-inset"
        tabIndex={0}
        role="application"
        aria-roledescription="360 degree panorama viewer"
        aria-label={`${scene.name}. Use arrow keys to pan, plus and minus to zoom, H to jump between hotspots, Enter to open the current hotspot, Home to reset.`}
        onKeyDown={handleKeyDown}
        style={
          scene.preview_url
            ? { backgroundImage: `url(${scene.preview_url})` }
            : scene.panorama_url.endsWith("chamber-main.jpg")
            ? { backgroundImage: `url(${scene.panorama_url.replace("chamber-main.jpg", "chamber-main-preview.jpg")})` }
            : undefined
        }
      />
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/80 text-white pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-ecowas-yellow" aria-hidden="true" />
            <p className="text-sm font-medium">Loading 360° view…</p>
          </div>
        </div>
      )}
      {/* Screen-reader keyboard help, always present but visually hidden */}
      <p className="sr-only">
        Keyboard controls: Arrow keys pan the view. Plus and minus zoom. Press H to cycle through {scene.hotspots.length} hotspot{scene.hotspots.length === 1 ? "" : "s"}. Press Enter or Space to open the currently focused hotspot. Press Home to reset the view.
      </p>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <style>{`
        .psv-hotspot-dot {
          width: 22px; height: 22px; border-radius: 9999px;
          background: hsl(var(--primary));
          border: 3px solid white;
          box-shadow: 0 0 0 6px hsl(var(--primary) / 0.25), 0 4px 14px rgba(0,0,0,0.4);
          cursor: pointer;
          animation: psv-pulse 2s ease-in-out infinite;
        }
        .psv-hotspot-dot:focus-visible {
          outline: 3px solid hsl(var(--ecowas-yellow, 48 96% 53%));
          outline-offset: 4px;
        }
        @keyframes psv-pulse {
          0%, 100% { box-shadow: 0 0 0 6px hsl(var(--primary) / 0.25), 0 4px 14px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 0 14px hsl(var(--primary) / 0.08), 0 4px 14px rgba(0,0,0,0.4); }
        }
        /* Make PSV navbar buttons clearly focusable */
        .psv-button:focus-visible {
          outline: 3px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}