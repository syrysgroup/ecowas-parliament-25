import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Wand2, Info, X } from "lucide-react";
import { toast } from "sonner";
import { loadOpenCv } from "@/lib/opencvLoader";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called with a stitched, 2:1-padded equirectangular JPEG blob. */
  onStitched: (blob: Blob, suggestedName: string) => void | Promise<void>;
}

async function fileToMat(cv: any, file: File): Promise<any> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);
  bmp.close?.();
  return cv.imread(canvas);
}

/** Pad a stitched panorama up to a perfect 2:1 equirectangular canvas. */
function padTo2to1(srcCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const { width: w, height: h } = srcCanvas;
  let targetW = w;
  let targetH = Math.round(w / 2);
  if (h > targetH) {
    targetH = h;
    targetW = h * 2;
  }
  const out = document.createElement("canvas");
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, targetW, targetH);
  const dx = Math.round((targetW - w) / 2);
  const dy = Math.round((targetH - h) / 2);
  ctx.drawImage(srcCanvas, dx, dy);
  return out;
}

export default function StitcherDialog({ open, onOpenChange, onStitched }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 60);
    setFiles(next);
  }
  function removeAt(i: number) {
    setFiles(files.filter((_, idx) => idx !== i));
  }
  function reset() {
    setFiles([]);
    setStatus("");
  }

  async function stitch() {
    if (files.length < 2) {
      toast.error("Add at least 2 photos (10–40 recommended).");
      return;
    }
    setBusy(true);
    setStatus("Loading stitching engine…");
    try {
      const cv = await loadOpenCv();
      setStatus(`Reading ${files.length} frames…`);
      const mats = new (cv.MatVector)();
      const opened: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const m = await fileToMat(cv, files[i]);
        opened.push(m);
        mats.push_back(m);
        setStatus(`Reading frames… ${i + 1}/${files.length}`);
      }
      setStatus("Stitching (this may take 30–90s)…");
      // PANORAMA mode = 0, SCANS = 1
      const stitcher = new cv.Stitcher(0);
      const result = new cv.Mat();
      const code = stitcher.stitch(mats, result);
      // 0 = OK, 1 = ERR_NEED_MORE_IMGS, 2 = ERR_HOMOGRAPHY_EST_FAIL, 3 = ERR_CAMERA_PARAMS_ADJUST_FAIL
      if (code !== 0) {
        result.delete();
        mats.delete();
        opened.forEach((m) => m.delete());
        const map: Record<number, string> = {
          1: "Need more overlapping images — try adding more frames.",
          2: "Could not align frames — increase overlap or reduce parallax.",
          3: "Camera calibration failed — frames may be too different.",
        };
        throw new Error(map[code] ?? `Stitcher failed (code ${code})`);
      }
      setStatus("Encoding result…");
      const stitchedCanvas = document.createElement("canvas");
      cv.imshow(stitchedCanvas, result);
      result.delete();
      mats.delete();
      opened.forEach((m) => m.delete());

      const padded = padTo2to1(stitchedCanvas);
      const blob: Blob = await new Promise((resolve, reject) =>
        padded.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas encoding failed"))),
          "image/jpeg",
          0.85,
        ),
      );
      const name = `stitched-${Date.now()}.jpg`;
      toast.success(`Stitched to ${padded.width}×${padded.height}`);
      await onStitched(blob, name);
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Stitching failed");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (busy ? null : onOpenChange(o))}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> Stitch raw photos into a panorama
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2 p-3 rounded-lg border border-border bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              Best results come from DJI <em>Sphere mode</em> auto-stitched exports — upload those
              directly in the scene dialog. Browser stitching is <strong>experimental</strong>:
              use 20–40 overlapping frames (~30% overlap each), consistent exposure, and minimal
              parallax. Output is padded to 2:1 so the viewer can display it.
            </div>
          </div>

          <label className="block">
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              hidden
              disabled={busy}
              onChange={(e) => {
                addFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
            <Button asChild variant="outline" disabled={busy} className="w-full">
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {files.length === 0 ? "Select photos" : `Add more (${files.length} selected)`}
              </span>
            </Button>
          </label>

          {files.length > 0 && (
            <div className="grid grid-cols-6 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group aspect-square rounded border border-border overflow-hidden bg-muted">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  {!busy && (
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded bg-background/80 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {status && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} {status}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={() => { reset(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={stitch} disabled={busy || files.length < 2}>
            {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Stitching…</> : <><Wand2 className="h-4 w-4 mr-2" /> Stitch {files.length} photos</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
