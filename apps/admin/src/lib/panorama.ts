/**
 * Helpers for ingesting equirectangular panoramas (e.g. DJI Mini 3 Sphere mode).
 * DJI Fly auto-stitches Sphere mode shots into a single 2:1 equirectangular JPG —
 * that's what these helpers expect.
 */

export type PanoramaValidation =
  | { ok: true; width: number; height: number; warning?: string }
  | { ok: false; error: string };

export async function validateEquirectangular(file: File): Promise<PanoramaValidation> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return { ok: false, error: "Panorama must be a JPG, PNG, or WebP image." };
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, error: "Could not read image — file may be corrupted." };
  }
  const { width, height } = bitmap;
  bitmap.close?.();
  if (width < 4096 || height < 2048) {
    return {
      ok: false,
      error: `Image is ${width}×${height}. A 360° panorama should be at least 4096×2048.`,
    };
  }
  const ratio = width / height;
  if (Math.abs(ratio - 2) > 0.04) {
    return {
      ok: false,
      error: `Aspect ratio is ${ratio.toFixed(2)}:1 but a 360° equirectangular panorama must be 2:1. ` +
        `In DJI Fly, capture using Photo → Pano → Sphere and export the stitched result.`,
    };
  }
  return { ok: true, width, height };
}

async function resizeToJpeg(file: File, targetWidth: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const w = targetWidth;
  const h = Math.round((bitmap.height / bitmap.width) * w);
  const canvas = typeof OffscreenCanvas !== "undefined"
    ? new OffscreenCanvas(w, h)
    : Object.assign(document.createElement("canvas"), { width: w, height: h });
  const ctx = (canvas as any).getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  if ("convertToBlob" in canvas) {
    return await (canvas as OffscreenCanvas).convertToBlob({ type: "image/jpeg", quality });
  }
  return await new Promise<Blob>((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality,
    );
  });
}

/** Returns mobile (4096w) + preview (1024w) JPEG derivatives. */
export async function generateDerivatives(file: File, sourceWidth: number) {
  const mobile = sourceWidth > 4096 ? await resizeToJpeg(file, 4096, 0.82) : null;
  const preview = await resizeToJpeg(file, 1024, 0.7);
  return { mobile, preview };
}