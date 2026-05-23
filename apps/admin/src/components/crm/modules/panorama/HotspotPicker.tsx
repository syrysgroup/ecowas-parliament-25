import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

type OtherHotspot = { id: string; yaw: number; pitch: number; title?: string };

type Props = {
  panoramaUrl: string;
  yaw: number;
  pitch: number;
  onPick: (yaw: number, pitch: number) => void;
  otherHotspots?: OtherHotspot[];
};

/**
 * Compact 360° viewer used inside the hotspot dialog.
 * Click anywhere in the panorama to drop a marker — the yaw/pitch
 * coordinates are written back via `onPick`. Other existing hotspots
 * can be passed in to render as faint context markers.
 */
export default function HotspotPicker({ panoramaUrl, yaw, pitch, onPick, otherHotspots = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !panoramaUrl) return;
    const viewer = new Viewer({
      container: containerRef.current,
      panorama: panoramaUrl,
      navbar: ["zoom", "fullscreen"],
      defaultYaw: yaw || 0,
      defaultPitch: pitch || 0,
      plugins: [[MarkersPlugin, { markers: [] }]],
    });
    viewerRef.current = viewer;

    const markers = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

    const renderAll = (y: number, p: number) => {
      markers.clearMarkers();
      // Context markers (other existing hotspots)
      otherHotspots.forEach((h) => {
        markers.addMarker({
          id: `ctx-${h.id}`,
          position: { yaw: h.yaw, pitch: h.pitch },
          html: `<div style="width:14px;height:14px;border-radius:9999px;background:rgba(120,120,120,.5);border:2px solid rgba(255,255,255,.7);box-shadow:0 0 0 2px rgba(0,0,0,.15)"></div>`,
          anchor: "center center",
          tooltip: h.title ? { content: h.title, position: "top center" } : undefined,
        });
      });
      // Active picker marker
      markers.addMarker({
        id: "picker",
        position: { yaw: y, pitch: p },
        html: `<div style="width:20px;height:20px;border-radius:9999px;background:#16a34a;border:3px solid #fff;box-shadow:0 0 0 4px rgba(22,163,74,.35)"></div>`,
        anchor: "center center",
      });
    };

    viewer.addEventListener("ready", () => renderAll(yaw || 0, pitch || 0), { once: true });

    const handleClick = (e: any) => {
      const data = e.data;
      if (!data) return;
      renderAll(data.yaw, data.pitch);
      onPick(data.yaw, data.pitch);
    };
    viewer.addEventListener("click", handleClick);

    return () => {
      viewer.removeEventListener("click", handleClick);
      viewer.destroy();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panoramaUrl]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[320px] rounded-lg border border-border bg-muted overflow-hidden"
    />
  );
}