# Parliament 3D Panoramic Tour

## Goal
Give visitors an immersive 360° walkthrough of the ECOWAS Parliament chamber using the 35 photos you provided, with hotspots, fullscreen/VR mode, autorotate, and prominent placement across the site.

## 1. Process the source photos (one-off, server-side)

Your 35 shots are unstitched, so we'll stitch them into one or more 360° equirectangular panoramas before they ever reach the browser (browsers can't reliably stitch 35 images in real time).

Steps I'll run in the sandbox once you confirm:
1. Unzip `Parl Panaroma.zip` into `/tmp/parl-pano/`.
2. Inspect the photos to determine whether they form **one** full 360° sphere or **multiple scenes** (e.g., floor, gallery, speaker view).
3. Stitch using OpenCV's `Stitcher` (PANORAMA mode) or Hugin CLI (`pto_gen` → `cpfind` → `autooptimiser` → `pano_modify` → `nona` → `enblend`) — whichever yields clean seams.
4. Export final equirectangular JPEG(s) at 6000×3000 (with a 3000×1500 mobile variant) and commit them to `apps/web/public/panorama/parliament/`.
5. Generate a low-res blurred preview for the loading state.

If stitching reveals distinct scenes, we treat them as a multi-scene tour (your "walk between spots" feature comes free).

## 2. Viewer library

Use **`@photo-sphere-viewer/core`** + plugins (`markers`, `autorotate`, `virtual-tour`, `gyroscope`). It's the most maintained 360° viewer, supports equirectangular, hotspots, autorotate, fullscreen, VR/gyroscope, and lazy-loads tiles. MIT-licensed, ~80KB gzipped core.

## 3. New React component

`apps/web/src/components/parliament/PanoramaViewer.tsx`
- Props: `scenes` (array of `{ id, panorama, name, hotspots[] }`), `autoRotate`, `defaultSceneId`.
- Loads PSV dynamically (`React.lazy` + dynamic import) so the heavy bundle only ships when the viewer is opened.
- Shows a branded loading shimmer over the blurred preview while the high-res image streams in.
- Hotspots render as pulsing ECOWAS-green dots; click opens a styled popover with title + description (data-driven, see §5).
- Toolbar: fullscreen, VR, reset view, scene picker (if multi-scene), autorotate toggle.

## 4. Placement

Per your choices:

| Location | Treatment |
|---|---|
| `/parliament-tour` (new route) | Full-bleed viewer, header overlay with title + nav back, hotspot legend, "About this chamber" side panel |
| `/ecowas-parliament` page | New section "Step Inside the Chamber" with an embedded viewer card + "Open full tour" CTA → `/parliament-tour` |
| `/` (homepage) | New `ParliamentTourSpotlight` block (after `PeopleMandateSection`) — blurred panorama preview, headline, "Launch 360° Tour" button |
| Navbar | Add "Virtual Tour" link under the Parliament dropdown |

## 5. Hotspot content (database-driven, per project convention)

New table `parliament_panorama_hotspots`:
- `scene_id text`, `yaw float`, `pitch float`, `title text`, `description text`, `image_url text nullable`, `link_url text nullable`, `display_order int`, `is_active boolean`
- RLS: public `select` where `is_active`; CRM staff (`is_crm_staff()`) full access.

CRM module: add a **"Virtual Tour"** tab inside the existing Parliament module (or a new lightweight `PanoramaModule.tsx` registered in `crmModules.ts`) where staff can:
- Pick a scene, click anywhere on a preview to set yaw/pitch
- Edit title/description, optional thumbnail + external link
- Reorder, toggle active

Seed 6–8 starter hotspots (Speaker's chair, Mace, Public gallery, Member benches, Press box, ECOWAS emblem) — final list adjustable from CRM.

## 6. Performance & UX

- Image format: progressive JPEG; serve via existing CDN (Amplify).
- Lazy-load PSV via dynamic import; route is code-split.
- Preload only the blurred preview on the homepage spotlight; full image loads on click.
- Respect `prefers-reduced-motion` → disable autorotate by default.
- Mobile: gyroscope opt-in (permission prompt on iOS), touch drag, pinch-zoom.
- SEO: `SEOHead` with title "Virtual Tour — ECOWAS Parliament Chamber", OG image = static panorama preview, JSON-LD `VirtualLocation`.

## 7. Accessibility

- Keyboard controls (arrow keys pan, +/- zoom, `F` fullscreen, `R` reset).
- Hotspots are real `<button>` elements with `aria-label`.
- Reduced-motion users get a static gallery fallback link.

## Technical details

**Dependencies to add** (in `apps/web/`):
```
@photo-sphere-viewer/core
@photo-sphere-viewer/markers-plugin
@photo-sphere-viewer/autorotate-plugin
@photo-sphere-viewer/virtual-tour-plugin
@photo-sphere-viewer/gyroscope-plugin
```

**Files to add**
- `apps/web/src/pages/ParliamentTour.tsx`
- `apps/web/src/components/parliament/PanoramaViewer.tsx`
- `apps/web/src/components/home/ParliamentTourSpotlight.tsx`
- `apps/web/public/panorama/parliament/scene-*.jpg` (+ `-preview.jpg`)
- `apps/admin/src/components/crm/modules/PanoramaModule.tsx` (+ register in `crmModules.ts`)
- `supabase/migrations/<ts>_parliament_panorama_hotspots.sql`

**Files to edit**
- `apps/web/src/App.tsx` — add `/parliament-tour` route
- `apps/web/src/components/layout/Navbar.tsx` — add "Virtual Tour" link
- `apps/web/src/pages/EcowasParliament.tsx` — embed viewer section
- `apps/web/src/pages/Index.tsx` — insert `ParliamentTourSpotlight`

## What I need from you to start

1. **Re-upload `Parl Panaroma.zip`** — only the first attachment came through and I need all 35 photos to stitch.
2. Confirmation that one stitched panorama (vs splitting into 2–3 scenes) is acceptable — I'll recommend after inspecting the photos.
3. Approve this plan, and I'll execute end-to-end (stitch → build viewer → wire CRM → ship).