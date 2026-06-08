import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

type Props = {
  panoramaUrl: string;
  yaw: number;
  pitch: number;
  onPick: (yaw: number, pitch: number) => void;
};

/**
 * Compact 360° viewer used inside the hotspot dialog.
 * Click anywhere in the panorama to drop a marker — the yaw/pitch
 * coordinates are written back via `onPick`.
 *
 * The viewer is deferred until the container actually has a non-zero
 * size, because it often mounts inside a hidden dialog/tab (width=0
 * → blank/black canvas).
 */
export default function HotspotPicker({ panoramaUrl, yaw, pitch, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !panoramaUrl) return;
    setLoadError(null);
    const container = containerRef.current;
    let cancelled = false;

    const handleClick = (e: any) => {
      const data = e.data;
      if (!data) return;
      const v = viewerRef.current;
      if (!v) return;
      const markers = v.getPlugin<MarkersPlugin>(MarkersPlugin);
      markers?.clearMarkers();
      markers?.addMarker({
        id: "picker",
        position: { yaw: data.yaw, pitch: data.pitch },
        html: `<div style="width:18px;height:18px;border-radius:9999px;background:#16a34a;border:3px solid #fff;box-shadow:0 0 0 2px #16a34a"></div>`,
        anchor: "center center",
      });
      onPick(data.yaw, data.pitch);
    };

    const createViewer = () => {
      if (cancelled || viewerRef.current) return;
      const rect = container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      try {
        const viewer = new Viewer({
          container,
          panorama: panoramaUrl,
          navbar: ["zoom", "fullscreen"],
          defaultYaw: yaw || 0,
          defaultPitch: pitch || 0,
          plugins: [[MarkersPlugin, { markers: [] }]],
        });
        viewerRef.current = viewer;

        viewer.addEventListener("ready", () => {
          if (cancelled) return;
          if (typeof yaw === "number" && typeof pitch === "number") {
            const markers = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
            markers?.addMarker({
              id: "picker",
              position: { yaw, pitch },
              html: `<div style="width:18px;height:18px;border-radius:9999px;background:#16a34a;border:3px solid #fff;box-shadow:0 0 0 2px #16a34a"></div>`,
              anchor: "center center",
            });
          }
        }, { once: true });

        viewer.addEventListener("panorama-load-error" as any, () => {
          if (!cancelled) setLoadError("Failed to load panorama image.");
        });

        viewer.addEventListener("click", handleClick);
      } catch (err) {
        console.error("[HotspotPicker] viewer init failed", err);
        if (!cancelled) setLoadError("Could not initialise the 360° viewer.");
      }
    };

    // Try immediately, and also watch for the container becoming visible/resized.
    createViewer();
    const ro = new ResizeObserver(() => {
      if (cancelled) return;
      if (!viewerRef.current) {
        createViewer();
      } else {
        try { viewerRef.current.resize?.({ width: container.clientWidth, height: container.clientHeight } as any); } catch { /* noop */ }
      }
    });
    ro.observe(container);

    return () => {
      cancelled = true;
      ro.disconnect();
      const v = viewerRef.current;
      if (v) {
        try { v.removeEventListener("click", handleClick); } catch { /* noop */ }
        try { v.destroy(); } catch { /* noop */ }
        viewerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panoramaUrl]);

  return (
    <div className="relative w-full h-[320px] rounded-lg border border-border bg-muted overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground p-4 text-center">
          {loadError}
        </div>
      )}
    </div>
  );
}
