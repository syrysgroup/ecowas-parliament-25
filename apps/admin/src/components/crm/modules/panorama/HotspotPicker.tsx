import { useEffect, useRef } from "react";
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
 */
export default function HotspotPicker({ panoramaUrl, yaw, pitch, onPick }: Props) {
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

    const placeMarker = (y: number, p: number) => {
      markers.clearMarkers();
      markers.addMarker({
        id: "picker",
        position: { yaw: y, pitch: p },
        html: `<div style="width:18px;height:18px;border-radius:9999px;background:#16a34a;border:3px solid #fff;box-shadow:0 0 0 2px #16a34a"></div>`,
        anchor: "center center",
      });
    };

    if (typeof yaw === "number" && typeof pitch === "number") {
      viewer.addEventListener("ready", () => placeMarker(yaw, pitch), { once: true });
    }

    const handleClick = (e: any) => {
      const data = e.data;
      if (!data) return;
      placeMarker(data.yaw, data.pitch);
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