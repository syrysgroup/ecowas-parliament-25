## Context

- An admin module already exists at `apps/admin/src/components/crm/modules/PanoramaModule.tsx` with: upload to the `parliament-panorama` storage bucket, scene CRUD, and hotspot CRUD. What's missing is (a) a DJI-aware ingest workflow and (b) a visual way to place hotspots without reading yaw/pitch from the console.
- The "Mariama Camara" sponsor contact line is a translation string used in 3 places per locale, in both `apps/web` and `apps/admin`.

## 1. Panorama: DJI Mini 3 ingest + stitching

The DJI Mini 3 has a built-in **Sphere panorama** mode: the drone shoots ~26 frames and the DJI Fly app auto-stitches them on the phone into a single equirectangular JPG (2:1, typically 8192×4096). That stitched file is what 360° viewers like Photo Sphere Viewer expect — no re-stitching needed.

Browser-side stitching of raw drone frames (Hugin/OpenCV-class work) is not practical in a Vite SPA. So the recommended approach is:

**A. Primary path — upload a pre-stitched panorama (already works, just guide the admin).**
- Add a clear "How to capture" callout in `PanoramaModule.tsx`: Shoot in DJI Fly → *Photo → Pano → Sphere* → wait for auto-stitch → export the equirectangular JPG → upload here.
- On upload, validate the file: must be JPG/PNG, aspect ratio ≈ 2:1 (tolerance ±2%), min 4096×2048. Show a warning toast if it's not equirectangular (this is exactly what causes the "not properly stitched" look the user is seeing — a flat aerial photo was probably uploaded instead of a Sphere export).
- Auto-generate two derivatives client-side via `<canvas>`: a `*-mobile.jpg` (4096×2048, quality 0.82) and a `*-preview.jpg` (1024×512, quality 0.7). Store all three URLs on the scene row (`panorama_url`, `mobile_panorama_url`, `preview_url`).

**B. Secondary path — multi-frame stitching (optional, deferred).**
True drone-frame stitching needs Hugin-class tooling. If wanted later, the right home is a Supabase edge function shelling out to a stitching service, or a desktop preprocessing step — not the browser. Out of scope for this change; the in-app text will tell the admin to use DJI Fly's built-in stitching.

## 2. Panorama: visual hotspot placement

Replace the "read yaw/pitch from the console" tip with a real picker:

- In the hotspot dialog, embed a small `<PanoramaViewer>` of the current scene with `autoRotate={false}`.
- Add a "Pick location" mode: enable Photo Sphere Viewer's `click` event; on click capture `data.yaw` / `data.pitch`, write them into the dialog state, and show a temporary marker at that point.
- Keep the manual yaw/pitch number inputs as a fallback.
- Same picker is reused when editing: load existing yaw/pitch as the initial marker.

## 3. Sponsor contact copy

Replace the "Mariama Camara, Sponsor Relations Manager…" line and related strings with the shared sponsorship email `sponsor@ecowasparliamentinitiatives.org`.

Files (web + admin, en/fr/pt = 6 files), keys:

- `contact.sponsorCardDesc` → "For tailored partnership packages, email sponsor@ecowasparliamentinitiatives.org." (translated per locale).
- `sponsor.ctaContact` → "Sponsorship enquiries: sponsor@ecowasparliamentinitiatives.org · Responds within 48 hours".
- `sponsorDash.accountManagerName` → "Sponsorship Team" (with the email shown alongside in the existing UI string for that section; will verify the surrounding component renders the email and add it if missing).

Also: if any component renders "Mariama Camara" as a hard-coded string (avatar caption, mailto), swap the `mailto:` to `sponsor@ecowasparliamentinitiatives.org` and remove the person's name. I'll grep both apps before editing.

## Technical notes

- New file: `apps/admin/src/components/crm/modules/panorama/HotspotPicker.tsx` (wraps `PanoramaViewer` from `apps/web` — the component is duplicated/imported into admin; will copy it under `apps/admin/src/components/parliament/PanoramaViewer.tsx` since admin doesn't currently import from web).
- New helper: `apps/admin/src/lib/panorama.ts` with `validateEquirectangular(file)` and `generateDerivatives(file)` using `createImageBitmap` + `OffscreenCanvas`.
- DB: no schema changes — `parliament_panorama_scenes` already has `panorama_url`, `mobile_panorama_url`, `preview_url`. (Will confirm `mobile_panorama_url` column exists; the web hook reads it, but if the column is missing I'll add a migration.)
- Storage: `parliament-panorama` bucket exists and is public.
- No package additions required: `@photo-sphere-viewer/core` is already installed for the web viewer; I'll add it to `apps/admin/package.json` (already used in web).

## Out of scope

- True multi-frame in-browser stitching (Hugin-class). Recommended workflow is DJI Fly's onboard Sphere stitching.
- Localised rewrite of every sponsor page beyond the three translation keys + any hard-coded "Mariama" mention found by grep.
