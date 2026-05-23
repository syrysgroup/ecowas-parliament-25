import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

export type MapHotspot = {
  id: string;
  yaw: number;
  pitch: number;
  title: string;
  display_order?: number;
  is_active?: boolean;
};

type Props = {
  panoramaUrl: string;
  hotspots: MapHotspot[];
  highlightId?: string | null;
  onEdit: (id: string) => void;
};

/**
 * Read-only panorama view showing all hotspots as numbered markers.
 * Click a marker to edit it. Used in the admin to identify POIs on the panorama.
 */
export default function SceneHotspotMap({ panoramaUrl, hotspots, highlightId, onEdit }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  // Build the viewer once per panorama URL
  useEffect(() => {
    if (!containerRef.current || !panoramaUrl) return;
    const viewer = new Viewer({
      container: containerRef.current,
      panorama: panoramaUrl,
      navbar: ["zoom", "move", "fullscreen"],
      plugins: [[MarkersPlugin, { markers: [] }]],
    });
    viewerRef.current = viewer;

    const markers = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
    markers.addEventListener("select-marker", ({ marker }) => {
      const id = (marker.config.data as any)?.id;
      if (id) onEdit(id);
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panoramaUrl]);

  // Sync markers whenever hotspots or highlight change
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const markers = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
    if (!markers) return;

    const setAll = () => {
      markers.setMarkers(
        hotspots.map((h, idx) => {
          const active = h.is_active !== false;
          const highlight = highlightId === h.id;
          const bg = highlight ? "#f59e0b" : active ? "#16a34a" : "#9ca3af";
          const border = active ? "#fff" : "#e5e7eb";
          const size = highlight ? 28 : 22;
          const ring = highlight ? "0 0 0 6px rgba(245,158,11,.35)" : `0 0 0 4px ${bg}33`;
          const dash = active ? "" : "border-style:dashed;";
          return {
            id: h.id,
            position: { yaw: h.yaw, pitch: h.pitch },
            html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:#fff;font:600 11px/1 system-ui;border:2px solid ${border};box-shadow:${ring};${dash}cursor:pointer">${(h.display_order ?? idx + 1)}</div>`,
            anchor: "center center",
            tooltip: { content: h.title || `Hotspot ${idx + 1}`, position: "top center" },
            data: { id: h.id },
          };
        }),
      );
    };

    // If viewer not yet ready, defer until ready event
    try {
      setAll();
    } catch {
      viewer.addEventListener("ready", () => setAll(), { once: true });
    }

    if (highlightId) {
      const h = hotspots.find((x) => x.id === highlightId);
      if (h) {
        try {
          viewer.animate({ yaw: h.yaw, pitch: h.pitch, speed: "5rpm" });
        } catch {
          /* viewer may not be ready */
        }
      }
    }
  }, [hotspots, highlightId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[360px] rounded-lg border border-border bg-muted overflow-hidden"
    />
  );
}
