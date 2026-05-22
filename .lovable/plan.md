## What already exists (no rebuild needed)

The admin Panorama module is fully wired:

- `apps/admin/src/components/crm/modules/PanoramaModule.tsx` — scenes + hotspots CRUD, upload to `parliament-panorama` bucket, auto-generated mobile/preview derivatives, visual `HotspotPicker`, ordering arrows, active toggles, "Preview live tour" links, default yaw/pitch/zoom picker.
- Registered in `crmModules.ts` as `parliament-tour` ("360° Tour") under CONTENT, visible to `super_admin`, `admin`, `website_editor`, `communications_officer`.
- Lazy-loaded in `CRMDashboard.tsx` at `/crm/parliament-tour`.
- DB tables `parliament_panorama_scenes` + `parliament_panorama_hotspots` and the public `parliament-panorama` storage bucket already exist.

The piece the user is missing is **raw multi-photo upload → stitched equirectangular panorama**. Today the uploader only accepts an already-stitched 2:1 JPG.

## What this plan adds

### 1. Raw-photo stitcher (new)

Add a second upload mode inside the scene dialog, beside the existing "Upload stitched panorama" button:

- **"Stitch raw photos"** button → opens a `StitcherDialog`.
- Multi-file picker accepting JPEG/PNG (10–40 frames typical for a sphere).
- Client-side stitching using **OpenCV.js** (`cv.Stitcher_create(cv.Stitcher.PANORAMA)`), loaded on demand from a CDN the first time the dialog opens so the main bundle isn't bloated.
- Progress UI: thumbnail strip of selected frames, "Stitching…" status, cancel button.
- After OpenCV returns a stitched canvas, run a **cylindrical → equirectangular pad** step in a `<canvas>`: pad the result to a 2:1 ratio (transparent/black bars top+bottom if vertical FOV < 180°) so the existing `validateEquirectangular` check passes and the Photo Sphere Viewer can display it.
- Export the result as JPEG (quality 0.85), feed it through the existing `uploadPanorama(blob)` path so mobile + preview derivatives are generated automatically and the scene fields populate.
- Clear in-dialog warning: "Best results come from DJI Sphere mode auto-stitched exports. Browser stitching is experimental — 20+ overlapping frames recommended; results vary with lens, exposure, and parallax."

Files:
- New: `apps/admin/src/components/crm/modules/panorama/StitcherDialog.tsx`
- New: `apps/admin/src/lib/opencvLoader.ts` (singleton loader for OpenCV.js from `https://docs.opencv.org/4.x/opencv.js`)
- Edit: `PanoramaModule.tsx` — add the "Stitch raw photos" button next to the existing Upload button, wire it to feed the resulting Blob through `uploadPanorama`.

### 2. Refactor `uploadPanorama` to accept Blob | File

Tiny change so the stitched canvas blob can reuse the same upload + derivative pipeline without a fake `File` wrapper.

### 3. Header hint + sidebar visibility

- Add a "Stitch raw photos" shortcut button in the module header (opens the stitcher with no pre-selected scene; on success it pre-fills a new scene dialog with the uploaded URLs).
- Verify `getModulesForRoles` already exposes `parliament-tour` to the four content roles (it does) — no change needed. If the user reports they still don't see it, the fix is to assign them one of those roles in `/crm/people`.

## Out of scope

- Server-side stitching (Deno edge functions can't run OpenCV cleanly; would require a separate Python service).
- True spherical projection correction for arbitrary phone-camera input — we ship cylindrical+pad with the experimental warning. DJI Sphere remains the recommended path.
- Any change to the public `/parliament-tour` page.

## Technical notes

- OpenCV.js is ~9 MB; loaded lazily only when the stitcher dialog opens, cached by the browser thereafter.
- No new npm dependency (CDN script tag injected by the loader).
- No DB migration; no RLS changes; no new storage bucket.
- `validateEquirectangular` already enforces the 2:1 ratio, so the stitched output must be padded before it's handed off — handled inside `StitcherDialog` before calling `uploadPanorama`.
