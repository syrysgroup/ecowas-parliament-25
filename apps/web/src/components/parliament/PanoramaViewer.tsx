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
            html: `<div class="psv-hotspot-dot" aria-label="${h.title.replace(/"/g, "&quot;")}"></div>`,
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

  return (
    <div className={`relative w-full h-full bg-black ${className ?? ""}`}>
      <div
        ref={containerRef}
        className="absolute inset-0 bg-center bg-cover"
        style={
          scene.preview_url
            ? { backgroundImage: `url(${scene.preview_url})` }
            : scene.panorama_url.endsWith("chamber-main.jpg")
            ? { backgroundImage: `url(${scene.panorama_url.replace("chamber-main.jpg", "chamber-main-preview.jpg")})` }
            : undefined
        }
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-ecowas-yellow" />
            <p className="text-sm font-medium">Loading 360° view…</p>
          </div>
        </div>
      )}
      <style>{`
        .psv-hotspot-dot {
          width: 22px; height: 22px; border-radius: 9999px;
          background: hsl(var(--primary));
          border: 3px solid white;
          box-shadow: 0 0 0 6px hsl(var(--primary) / 0.25), 0 4px 14px rgba(0,0,0,0.4);
          cursor: pointer;
          animation: psv-pulse 2s ease-in-out infinite;
        }
        @keyframes psv-pulse {
          0%, 100% { box-shadow: 0 0 0 6px hsl(var(--primary) / 0.25), 0 4px 14px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 0 14px hsl(var(--primary) / 0.08), 0 4px 14px rgba(0,0,0,0.4); }
        }
      `}</style>
    </div>
  );
}